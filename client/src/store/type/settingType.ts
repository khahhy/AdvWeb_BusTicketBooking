export enum GatewayType {
  momo = "momo",
  zalopay = "zalopay",
  payos = "payos",
  paypal_sandbox = "paypal_sandbox",
}

export interface GeneralSettingsDto {
  hotline: string;
  email: string;
  maintenanceMode: boolean;
}

export interface BookingRulesSettingsDto {
  paymentHoldTimeMinutes: number;
  minCancellationHours: number;
  refundPercentage: number;
}

export interface BusAmenitiesSettingsDto {
  amenities: string[];
}

export interface GatewayConfigDto {
  provider: GatewayType;
  enabled: boolean;
  isSandbox: boolean;
  apiKey?: string;
  secretKey?: string;
}

export interface PaymentGatewaySettingsDto {
  gateways: GatewayConfigDto[];
}

export interface BusTypePricingDto {
  standard: number;
  vip?: number;
  sleeper?: number;
  limousine?: number;
}

export interface PricingPoliciesDto {
  pricePerKm: number;
  weekendSurcharge: number;
  holidaySurcharge: number;
}
