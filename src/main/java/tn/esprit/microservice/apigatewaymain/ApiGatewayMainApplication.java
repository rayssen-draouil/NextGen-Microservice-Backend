package tn.esprit.microservice.apigatewaymain;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient

public class ApiGatewayMainApplication {

        public static void main(String[] args) {
                SpringApplication.run(ApiGatewayMainApplication.class, args);
        }

        @Bean
        public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
                return builder.routes()
                                .route("Livraison", r -> r.path("/livraisons/**")
                                                .uri("lb://LIVRAISON"))
                                .route("Restaurant", r -> r.path("/restaurants/**")
                                                .uri("lb://RESTAURANT"))
                                .route("Menus", r -> r.path("/menus/**")
                                                .uri("lb://MENU"))
                                .route("Order", r -> r.path("/order/**")
                                                .uri("lb://ORDER"))
                                .route("Reclamation", r -> r.path("/reclamations/**")
                                                .uri("lb://AVIS"))
                                .build();
        }
}
