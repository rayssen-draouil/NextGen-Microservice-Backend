package tn.esprit.restaurant.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.restaurant.dto.OrderDTO;

import java.util.List;

@FeignClient(name = "ORDER")
public interface OrderClient {

    @GetMapping("/order/{id}")
    OrderDTO getOrderById(@PathVariable("id") Integer id);

    @GetMapping("/order")
    List<OrderDTO> getAllOrders();
}
