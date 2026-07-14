package com.dangquocvinh.workflow_backend.payment.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class VNPayConfig {
    @Value("${vnp.payUrl:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnp_PayUrl;

    @Value("${vnp.returnUrl:http://localhost:5173/payment-result}")
    private String vnp_ReturnUrl;

    @Value("${vnp.tmnCode:XKHLB8KL}")
    private String vnp_TmnCode;

    @Value("${vnp.hashSecret:KE3IBRMN33QQT8MGN0A10G3P6GMTQMDY}")
    private String vnp_HashSecret;

    @Value("${vnp.apiUrl:https://sandbox.vnpayment.vn/merchant_webapi/api/transaction}")
    private String vnp_ApiUrl;
}
