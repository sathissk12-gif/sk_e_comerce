import { Controller, Get, Post, Put, Delete, Patch, Param, Query, Body, UseGuards, NotFoundException, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { DatabaseStore, Product, ProductVariant } from '../data/db';
import { AdminGuard } from '../auth/admin.guard';

@Controller('api/products')
export class ProductsController {
  private db = DatabaseStore.getInstance();

  @Get()
  getAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('isCombo') isCombo?: string
  ) {
    let list = this.db.products;

    if (category && category !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (isCombo !== undefined) {
      const boolVal = isCombo === 'true';
      list = list.filter(p => p.isCombo === boolVal);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      total: list.length,
      products: list
    };
  }

  @Get('categories')
  getCategories() {
    const counts: Record<string, number> = {};
    for (const p of this.db.products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }

    return {
      success: true,
      categories: [
        { id: 'all', name: 'All Products', count: this.db.products.length },
        { id: 'casseroles', name: 'Insulated Casseroles', count: counts['casseroles'] || 0 },
        { id: 'combos', name: 'Combos & Gift Sets', count: counts['combos'] || 0 },
        { id: 'tiffins', name: 'Lunch Boxes & Tiffins', count: counts['tiffins'] || 0 },
        { id: 'bottles', name: 'Bottles & Flasks', count: counts['bottles'] || 0 },
        { id: 'coolers', name: 'Thermo Wagon Coolers', count: counts['coolers'] || 0 },
        { id: 'containers', name: 'Airtight Storage Jars', count: counts['containers'] || 0 },
        { id: 'organizers', name: 'Storage Boxes & Organizers', count: counts['organizers'] || 0 },
        { id: 'household', name: 'Household & Pedal Bins', count: counts['household'] || 0 }
      ]
    };
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    const prod = this.db.products.find(p => p.id === id || p.slug === id);
    if (!prod) {
      throw new NotFoundException(`Product not found: ${id}`);
    }
    return { success: true, product: prod };
  }

  @UseGuards(AdminGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.resolve(__dirname, '../../public/products');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname).toLowerCase() || '.png';
          cb(null, `prod_${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif|svg\+xml)$/)) {
          return cb(new BadRequestException('Only image files (jpg, jpeg, png, webp, gif, svg) are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided.');
    }

    // Also copy to client/public/products if it exists so Next.js frontend has it immediately
    try {
      const clientDir = path.resolve(__dirname, '../../../client/public/products');
      if (fs.existsSync(clientDir)) {
        fs.copyFileSync(file.path, path.join(clientDir, file.filename));
      }
    } catch (e) {
      console.warn('Could not sync uploaded image to client/public/products:', e);
    }

    return {
      success: true,
      imageUrl: `/products/${file.filename}`,
      filename: file.filename,
    };
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() body: any) {
    if (!body.name || !body.category || !body.mrp || !body.offerPrice) {
      throw new BadRequestException('Name, category, mrp, and offerPrice are required.');
    }

    const id = `prod-${Date.now()}`;
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const discountPct = Math.round(((body.mrp - body.offerPrice) / body.mrp) * 100);

    const variant: ProductVariant = {
      id: `var-${id}-1`,
      sku: body.sku || `HT-${slug.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      name: body.variantName || body.capacity || 'Standard Set',
      capacity: body.capacity || undefined,
      colors: Array.isArray(body.colors)
        ? body.colors
        : typeof body.colors === 'string' && body.colors.trim()
        ? body.colors.split(',').map((c: string) => c.trim())
        : ['Classic Blue', 'Pearl White', 'Matte Grey'],
      mrp: Number(body.mrp),
      offerPrice: Number(body.offerPrice),
      discountPct: discountPct > 0 ? discountPct : 0,
      stockQty: Number(body.stockQty) || 25,
      rackLocation: body.rackLocation || 'RACK-HT-MAIN'
    };

    const newProduct: Product = {
      id,
      slug,
      name: body.name,
      brand: body.brand || 'Homely',
      category: body.category,
      description: body.description || 'Premium food-grade insulated product crafted for home & gifting.',
      badge: body.badge || 'FESTIVE OFFER',
      imageUrl: body.imageUrl || '/products/master_casserole.png',
      isCombo: Boolean(body.isCombo),
      comboIncludes: body.comboIncludes || undefined,
      variants: [variant]
    };

    this.db.products.unshift(newProduct);
    this.db.save();

    return {
      success: true,
      message: 'Product created successfully',
      product: newProduct
    };
  }

  @UseGuards(AdminGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const index = this.db.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Product not found: ${id}`);
    }

    const prod = this.db.products[index];
    if (body.name) prod.name = body.name;
    if (body.brand) prod.brand = body.brand;
    if (body.category) prod.category = body.category;
    if (body.description) prod.description = body.description;
    if (body.badge) prod.badge = body.badge;
    if (body.imageUrl) prod.imageUrl = body.imageUrl;

    if (body.mrp || body.offerPrice || body.stockQty !== undefined || body.rackLocation || body.colors) {
      if (prod.variants && prod.variants.length > 0) {
        const v = prod.variants[0];
        if (body.mrp) v.mrp = Number(body.mrp);
        if (body.offerPrice) v.offerPrice = Number(body.offerPrice);
        if (v.mrp && v.offerPrice) {
          v.discountPct = Math.round(((v.mrp - v.offerPrice) / v.mrp) * 100);
        }
        if (body.stockQty !== undefined) v.stockQty = Number(body.stockQty);
        if (body.rackLocation) v.rackLocation = body.rackLocation;
        if (body.colors) {
          v.colors = Array.isArray(body.colors)
            ? body.colors
            : typeof body.colors === 'string'
            ? body.colors.split(',').map((c: string) => c.trim())
            : v.colors;
        }
      }
    }

    this.db.save();
    return { success: true, message: 'Product updated successfully', product: prod };
  }

  @UseGuards(AdminGuard)
  @Patch(':id/stock')
  adjustStock(@Param('id') id: string, @Body() body: { delta?: number; stockQty?: number }) {
    const prod = this.db.products.find(p => p.id === id);
    if (!prod || !prod.variants || prod.variants.length === 0) {
      throw new NotFoundException(`Product or variant not found: ${id}`);
    }

    const v = prod.variants[0];
    if (body.stockQty !== undefined) {
      v.stockQty = Math.max(0, Number(body.stockQty));
    } else if (body.delta !== undefined) {
      v.stockQty = Math.max(0, v.stockQty + Number(body.delta));
    }

    this.db.save();
    return { success: true, newStock: v.stockQty, product: prod };
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    const index = this.db.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Product not found: ${id}`);
    }

    const deleted = this.db.products.splice(index, 1);
    this.db.save();
    return { success: true, message: 'Product deleted', product: deleted[0] };
  }
}
