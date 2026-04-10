package tn.esprit.microservice.livraison.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.microservice.livraison.Entities.Livraison;
import tn.esprit.microservice.livraison.Services.LivraisonService;

import javax.sql.DataSource;
import java.util.List;

@RestController
@RequestMapping("/livraisons")
public class LivraisonRestAPI {
    private String title = "Hello , I'm the livraison microservice";

    @GetMapping("/hello")
    public String sayHello() {
        System.out.println(title);
        return title;
    }

    @Autowired
    DataSource dataSource;

    @GetMapping("/db-info")
    public String getDbInfo() throws Exception {
        return dataSource.getConnection().getMetaData().getDatabaseProductName();
    }

    @Autowired
    private LivraisonService livraisonService;

    @GetMapping
    public ResponseEntity<List<Livraison>> getListLivraisons() {
        List<Livraison> livraisons = livraisonService.findAll();
        if (livraisons.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(livraisons);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Livraison> getLivraisonById(@PathVariable("id") int id) {
        return livraisonService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Livraison> createLivraison(@RequestBody Livraison livraison) {
        return new ResponseEntity<>(livraisonService.addLivraison(livraison), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Livraison> updateLivraison(@PathVariable("id") int id,
            @RequestBody Livraison livraison){
        return ResponseEntity.ok(livraisonService.updateLivraison(id, livraison));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLivraison(@PathVariable("id") int id){
        return new ResponseEntity<>(livraisonService.deleteLivraison(id), HttpStatus.OK);
    }
}

