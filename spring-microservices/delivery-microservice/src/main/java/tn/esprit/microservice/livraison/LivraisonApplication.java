package tn.esprit.microservice.livraison;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import tn.esprit.microservice.livraison.Entities.Livraison;
import tn.esprit.microservice.livraison.Repositories.LivraisonRepository;

import java.math.BigDecimal;
import java.time.LocalDate;

@SpringBootApplication
public class LivraisonApplication {

    public static void main(String[] args) {
        SpringApplication.run(LivraisonApplication.class, args);
    }

    @Autowired
    private LivraisonRepository repository;

    @Bean
    ApplicationRunner init() {
        return (args) -> {
            if(repository.count() == 0) {
                repository.save(new Livraison(LocalDate.now().plusDays(2), "En préparation", "123 Avenue Habib Bourguiba, Tunis", new BigDecimal("5.50")));
                repository.save(new Livraison(LocalDate.now().plusDays(1), "Expédiée", "456 Rue de la République, Sfax", new BigDecimal("7.00")));
                repository.save(new Livraison(LocalDate.now(), "Livrée", "789 Boulevard du 7 Novembre, Sousse", new BigDecimal("6.00")));
                repository.save(new Livraison(LocalDate.now().minusDays(1), "Retardée", "321 Avenue Farhat Hached, Ariana", new BigDecimal("8.50")));
            }
            repository.findAll().forEach(System.out::println);
        };
    }
}

