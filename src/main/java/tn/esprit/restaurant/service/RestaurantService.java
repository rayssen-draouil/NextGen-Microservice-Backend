package tn.esprit.restaurant.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.restaurant.client.ReclamationClient;
import tn.esprit.restaurant.client.OrderClient;
import tn.esprit.restaurant.dto.ReclamationDTO;
import tn.esprit.restaurant.dto.OrderDTO;
import tn.esprit.restaurant.entity.Restaurant;
import tn.esprit.restaurant.repository.RestaurantRepository;

import java.util.List;
import java.util.Optional;

@Service
public class RestaurantService {

    private final RestaurantRepository repository;
    private final ReclamationClient reclamationClient;
    private final OrderClient orderClient;

    public RestaurantService(RestaurantRepository repository,
            ReclamationClient reclamationClient,
            OrderClient orderClient) {
        this.repository = repository;
        this.reclamationClient = reclamationClient;
        this.orderClient = orderClient;
    }

    public List<Restaurant> findAll() {
        return repository.findAll();
    }

    public Restaurant findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
    }

    public Restaurant create(Restaurant restaurant) {
        restaurant.setId(null);
        return repository.save(restaurant);
    }

    public Restaurant update(Long id, Restaurant restaurant) {
        Optional<Restaurant> existing = repository.findById(id);
        if (existing.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found");
        }
        Restaurant r = existing.get();
        r.setName(restaurant.getName());
        r.setAddress(restaurant.getAddress());
        r.setPhone(restaurant.getPhone());
        r.setEmail(restaurant.getEmail());
        r.setOpeningHours(restaurant.getOpeningHours());
        r.setStatus(restaurant.getStatus());
        return repository.save(r);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found");
        }
        repository.deleteById(id);
    }

    // ===== OpenFeign Methods (Restaurant -> Avis) =====

    public ReclamationDTO getReclamationById(Long reclamationId) {
        return reclamationClient.getReclamationById(reclamationId);
    }

    public List<ReclamationDTO> getAllReclamations() {
        return reclamationClient.getAllReclamations();
    }

    // ===== OpenFeign Methods (Restaurant -> Order) =====

    public OrderDTO getOrderById(Integer orderId) {
        return orderClient.getOrderById(orderId);
    }

    public List<OrderDTO> getAllOrders() {
        return orderClient.getAllOrders();
    }
}
