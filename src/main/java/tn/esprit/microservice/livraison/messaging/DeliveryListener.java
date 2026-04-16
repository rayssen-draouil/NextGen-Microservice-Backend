package tn.esprit.microservice.livraison.messaging;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import tn.esprit.microservice.livraison.Entities.Livraison;
import tn.esprit.microservice.livraison.Repositories.LivraisonRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Component
public class DeliveryListener {

    private final LivraisonRepository repository;

    public DeliveryListener(LivraisonRepository repository) {
        this.repository = repository;
    }

    @RabbitListener(queues = RabbitConfig.ORDER_CREATED_QUEUE)
    public void handleOrderCreated(Map<String, Object> payload) {
        try {
            System.out.println("Received order message: " + payload);
            // Create a simple Livraison entry based on order info
            String adresse = payload.getOrDefault("adresse", "Adresse inconnue").toString();
            Livraison l = new Livraison(LocalDate.now().plusDays(2), "En préparation", adresse, new BigDecimal("5.00"));
            repository.save(l);
            System.out.println("Created Livraison id=" + l.getIdLivraison());
        } catch (Exception ex) {
            System.err.println("Failed processing order message: " + ex.getMessage());
        }
    }
}
