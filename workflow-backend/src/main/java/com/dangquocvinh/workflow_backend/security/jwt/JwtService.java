package com.dangquocvinh.workflow_backend.security.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtService {
    @Value("${app.jwt.secret}")
    private String SECRET;

    @Value("${app.jwt.expiration-ms}")
    private int EXPIRATION_MS;

    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(item -> item.getAuthority()).collect(Collectors.toList());

        return JWT.create()
                .withSubject(userPrincipal.getUsername())
                .withClaim("roles", roles)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .sign(Algorithm.HMAC256(SECRET));
    }

    public String getUserNameFromJwtToken(String token) {
        return JWT.require(Algorithm.HMAC256(SECRET)).build().verify(token).getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            JWT.require(Algorithm.HMAC256(SECRET)).build().verify(authToken);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
