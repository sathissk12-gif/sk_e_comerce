import { Controller, Get, Post, Delete, Param, Body, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseStore, Coupon } from '../data/db';
import { AdminGuard } from '../auth/admin.guard';

@Controller('api/coupons')
export class CouponsController {
  private db = DatabaseStore.getInstance();

  @Get()
  getAll() {
    return { success: true, coupons: this.db.coupons };
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() body: any) {
    if (!body.code || !body.value) {
      throw new BadRequestException('Coupon code and discount value are required.');
    }

    const code = body.code.trim().toUpperCase();
    const existing = this.db.coupons.find(c => c.code === code);
    if (existing) {
      throw new BadRequestException(`Coupon with code ${code} already exists.`);
    }

    const newCoupon: Coupon = {
      code,
      description: body.description || `${body.value}% festive discount offer`,
      discountType: body.discountType === 'fixed' ? 'fixed' : 'percentage',
      value: Number(body.value),
      minOrder: Number(body.minOrder) || 0,
      expiresAt: body.expiresAt || new Date(Date.now() + 86400000 * 90).toISOString()
    };

    this.db.coupons.push(newCoupon);
    this.db.save();

    return {
      success: true,
      message: 'Coupon created successfully',
      coupon: newCoupon
    };
  }

  @UseGuards(AdminGuard)
  @Delete(':code')
  remove(@Param('code') code: string) {
    const cleanCode = code.trim().toUpperCase();
    const index = this.db.coupons.findIndex(c => c.code === cleanCode);
    if (index === -1) {
      throw new NotFoundException(`Coupon "${cleanCode}" not found.`);
    }

    const removed = this.db.coupons.splice(index, 1);
    this.db.save();

    return {
      success: true,
      message: `Coupon "${cleanCode}" removed successfully`,
      coupon: removed[0]
    };
  }

  @Post('validate')
  validate(@Body() body: { code: string; cartTotal: number }) {
    if (!body.code) {
      throw new BadRequestException('Coupon code is required');
    }

    const coupon = this.db.coupons.find(
      c => c.code.toUpperCase() === body.code.trim().toUpperCase()
    );

    if (!coupon) {
      return {
        valid: false,
        message: `Invalid coupon code "${body.code}"`
      };
    }

    const cartTotal = body.cartTotal || 0;
    if (cartTotal < coupon.minOrder) {
      return {
        valid: false,
        message: `Coupon "${coupon.code}" requires minimum order of ₹${coupon.minOrder}. Add ₹${coupon.minOrder - cartTotal} more!`
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((cartTotal * coupon.value) / 100);
    } else {
      discountAmount = coupon.value;
    }

    // Ensure discount does not exceed 70% of order
    discountAmount = Math.min(discountAmount, Math.round(cartTotal * 0.7));

    return {
      valid: true,
      code: coupon.code,
      discountAmount,
      description: coupon.description,
      message: `Festival treat applied! Saved ₹${discountAmount} with ${coupon.code}`
    };
  }
}
