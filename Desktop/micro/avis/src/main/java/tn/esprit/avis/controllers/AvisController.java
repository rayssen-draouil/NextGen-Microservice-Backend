package tn.esprit.avis.controllers;

import tn.esprit.avis.entities.Avis;
import tn.esprit.avis.services.AvisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/avis")
public class AvisController {

    @Autowired
    private AvisService avisService;

    // CREATE or UPDATE an Avis
    @PostMapping("/add")
    public Avis addAvis(@RequestBody Avis avis) {
        return avisService.addAvis(avis);
    }
    // GET ALL Avis
    @GetMapping("/all")
    public ResponseEntity<List<Avis>> getAllAvis() {
        List<Avis> avisList = avisService.getAllAvis();
        return ResponseEntity.ok(avisList);
    }

    // GET Avis by ID
    @GetMapping("/{id}")
    public ResponseEntity<Avis> getAvisById(@PathVariable Long id) {
        return avisService.getAvisById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // UPDATE Avis
    @PutMapping("/update/{id}")
    public ResponseEntity<Avis> updateAvis(@PathVariable Long id, @RequestBody Avis avisDetails) {
        return avisService.getAvisById(id).map(avis -> {
            avis.setUtilisateurId(avisDetails.getUtilisateurId());
            avis.setLivreurId(avisDetails.getLivreurId());
            avis.setNote(avisDetails.getNote());
            avis.setCommentaire(avisDetails.getCommentaire());
            avis.setDateAvis(avisDetails.getDateAvis());
            Avis updatedAvis = avisService.saveAvis(avis);
            return ResponseEntity.ok(updatedAvis);
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE Avis
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteAvis(@PathVariable Long id) {
        if (avisService.getAvisById(id).isPresent()) {
            avisService.deleteAvis(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
