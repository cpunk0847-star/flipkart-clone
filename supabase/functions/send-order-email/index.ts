import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  id: string;
  name: string;
  image: string;
  brand: string;
  price: number;
  originalPrice: number;
  quantity: number;
}

interface OrderEmailRequest {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  deliveryAddress: {
    name: string;
    phone: string;
    address: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
  };
  estimatedDeliveryDate: string;
}

const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    upi: "UPI",
    card: "Credit/Debit Card",
    netbanking: "Net Banking",
    wallet: "Digital Wallet",
    cod: "Cash on Delivery",
    emi: "EMI",
  };
  return labels[method] || method;
};

const generateEmailHTML = (order: OrderEmailRequest): string => {
  const itemsHTML = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" />
            <div>
              <p style="font-weight: 600; margin: 0 0 4px 0; color: #1f2937;">${item.name}</p>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">${item.brand}</p>
            </div>
          </div>
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          <p style="font-weight: 600; margin: 0;">₹${item.price.toLocaleString()}</p>
          ${item.originalPrice > item.price ? `<p style="font-size: 12px; color: #6b7280; text-decoration: line-through; margin: 0;">₹${item.originalPrice.toLocaleString()}</p>` : ""}
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
          ₹${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${order.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0 0 8px 0; font-size: 28px;">Order Confirmed! 🎉</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Thank you for your purchase, ${order.customerName}!</p>
    </div>
    
    <!-- Main Content -->
    <div style="background-color: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      
      <!-- Order Details -->
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <p style="font-size: 12px; color: #6b7280; margin: 0;">ORDER NUMBER</p>
            <p style="font-weight: 700; color: #1f2937; margin: 4px 0 0 0; font-size: 18px;">${order.orderNumber}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 12px; color: #6b7280; margin: 0;">ORDER DATE</p>
            <p style="font-weight: 600; color: #1f2937; margin: 4px 0 0 0;">${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>
      </div>

      <!-- Estimated Delivery -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 16px 20px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; font-weight: 600; color: #92400e;">📦 Expected Delivery</p>
        <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 700; color: #78350f;">${order.estimatedDeliveryDate}</p>
      </div>

      <!-- Order Items -->
      <h2 style="font-size: 18px; color: #1f2937; margin: 0 0 16px 0;">Order Items</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Product</th>
            <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase;">Qty</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 12px; color: #6b7280; text-transform: uppercase;">Price</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 12px; color: #6b7280; text-transform: uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <!-- Price Summary -->
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #6b7280;">Subtotal</span>
          <span style="color: #1f2937;">₹${(order.subtotal + order.discount).toLocaleString()}</span>
        </div>
        ${order.discount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #059669;">Discount</span>
          <span style="color: #059669;">-₹${order.discount.toLocaleString()}</span>
        </div>
        ` : ""}
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #6b7280;">Delivery</span>
          <span style="color: ${order.deliveryCharge === 0 ? '#059669' : '#1f2937'}">${order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <span style="color: #6b7280;">Tax (GST)</span>
          <span style="color: #1f2937;">₹${order.tax.toLocaleString()}</span>
        </div>
        <div style="border-top: 2px solid #e5e7eb; padding-top: 16px; display: flex; justify-content: space-between;">
          <span style="font-size: 18px; font-weight: 700; color: #1f2937;">Total Amount</span>
          <span style="font-size: 18px; font-weight: 700; color: #2563eb;">₹${order.totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <!-- Delivery Address & Payment -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 12px;">
          <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin: 0 0 8px 0;">Delivery Address</p>
          <p style="font-weight: 600; margin: 0 0 4px 0; color: #1f2937;">${order.deliveryAddress.name}</p>
          <p style="font-size: 14px; color: #6b7280; margin: 0;">${order.deliveryAddress.phone}</p>
          <p style="font-size: 14px; color: #6b7280; margin: 8px 0 0 0;">
            ${order.deliveryAddress.address}, ${order.deliveryAddress.locality}<br>
            ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}
          </p>
        </div>
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 12px;">
          <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin: 0 0 8px 0;">Payment Method</p>
          <p style="font-weight: 600; margin: 0; color: #1f2937;">${getPaymentMethodLabel(order.paymentMethod)}</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">Need help with your order?</p>
        <p style="color: #2563eb; font-weight: 600; margin: 0;">Contact our support team</p>
      </div>
    </div>

    <!-- Footer Note -->
    <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
      This email was sent to ${order.customerEmail}. If you have any questions, please contact support.
    </p>
  </div>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Send order email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderEmailRequest = await req.json();
    console.log("Order data received:", orderData.orderNumber);

    // Validate required fields
    if (!orderData.customerEmail || !orderData.orderNumber) {
      throw new Error("Missing required fields: customerEmail or orderNumber");
    }

    const emailHTML = generateEmailHTML(orderData);

    console.log("Sending email to:", orderData.customerEmail);

    const emailResponse = await resend.emails.send({
      from: "EasyShip <onboarding@resend.dev>",
      to: [orderData.customerEmail],
      subject: `Order Confirmed! #${orderData.orderNumber}`,
      html: emailHTML,
    });

    console.log("Email sent successfully:", emailResponse);

    // Update order email_sent status in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", orderData.orderId);

    if (updateError) {
      console.error("Failed to update order email status:", updateError);
    } else {
      console.log("Order email status updated successfully");
    }

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
