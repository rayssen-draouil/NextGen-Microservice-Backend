package tn.esprit.microservice.livraison.client;

import tn.esprit.microservice.livraison.dto.OrderDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "ORDER")
public interface OrderClient {

    @GetMapping("/order/{id}") // or /orders/{id}, will adjust if needed
    OrderDTO getOrderById(@PathVariable("id") Integer id);

    @GetMapping("/order")
    List<OrderDTO> getAllOrders();

    @GetMapping("/order/livreur/{livreurId}")
    List<OrderDTO> getOrdersByLivreurId(@PathVariable("livreurId") String livreurId);
}
