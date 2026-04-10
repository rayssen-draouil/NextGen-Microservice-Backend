package tn.esprit.restaurant.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.restaurant.dto.ReclamationDTO;

import java.util.List;

@FeignClient(name = "AVIS")
public interface ReclamationClient {

    @GetMapping("/reclamations/{id}")
    ReclamationDTO getReclamationById(@PathVariable("id") Long id);

    @GetMapping("/reclamations")
    List<ReclamationDTO> getAllReclamations();
}
