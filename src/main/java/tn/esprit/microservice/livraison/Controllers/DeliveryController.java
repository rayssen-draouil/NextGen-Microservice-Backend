package tn.esprit.microservice.livraison.Controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.microservice.livraison.Services.LivraisonService;
import tn.esprit.microservice.livraison.dto.OrderDTO;

@RestController
@RequestMapping("/delivery")
public class DeliveryController {

    private final LivraisonService livraisonService;

    public DeliveryController(LivraisonService livraisonService) {
        this.livraisonService = livraisonService;
    }

    @GetMapping("/order/{id}")
    public OrderDTO getOrder(@PathVariable Integer id) {
        return livraisonService.getOrderForDelivery(id);
    }

    @GetMapping("/orders")
    public java.util.List<OrderDTO> getAllOrders() {
        return livraisonService.getAllOrdersFromOrderService();
    }

    @GetMapping("/livreur/{livreurId}/orders")
    public java.util.List<OrderDTO> getOrdersByLivreur(@PathVariable String livreurId) {
        return livraisonService.getOrdersByLivreurId(livreurId);
    }
}
