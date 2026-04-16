package tn.esprit.microservice.apigatewaymain;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.reactive.CorsWebFilter;

import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

        @Bean
        public CorsWebFilter corsWebFilter() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOriginPatterns(List.of(
                                "http://localhost:*",
                                "http://127.0.0.1:*"
                ));
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                configuration.addAllowedHeader("*");
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return new CorsWebFilter(source);
        }

    @Bean
    @Order(0)
    public SecurityWebFilterChain publicRoutes(ServerHttpSecurity http) {
        return http
                .securityMatcher(ServerWebExchangeMatchers.pathMatchers(
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/webjars/**",
                        "/v3/api-docs",
                        "/v3/api-docs/**",
                        "/v3/api-docs/swagger-config",
                        "/docs/order",
                        "/docs/order/**",
                        "/docs/delivery",
                        "/docs/delivery/**",
                        "/docs/restaurants",
                        "/docs/restaurants/**",
                        "/docs/reclamations",
                        "/docs/reclamations/**",
                        "/docs/menus",
                        "/docs/menus/**",
                        "/auth/login",
                        "/auth/**",
                        "/restaurants",
                        "/restaurants/**",
                        "/delivery",
                        "/delivery/**",
                        "/livraisons",
                        "/livraisons/**",
                        "/order",
                        "/order/**",
                        "/menus",
                        "/menus/**",
                        "/reclamations",
                        "/reclamations/**",
                        "/users",
                        "/users/**",
                        "/user/api-json",
                        "/user/api-json/**",
                        "/eureka/**"
                ))
                .cors(Customizer.withDefaults())
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchange -> exchange
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyExchange().permitAll()
                )
                .build();
    }

    @Bean
    @Order(1)
    public SecurityWebFilterChain securedRoutes(ServerHttpSecurity http) {
        return http
                .cors(Customizer.withDefaults())
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchange -> exchange.anyExchange().authenticated())
                .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()))
                .build();
    }
}
