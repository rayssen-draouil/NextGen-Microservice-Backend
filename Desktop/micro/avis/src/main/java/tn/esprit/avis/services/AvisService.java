package tn.esprit.avis.services;

import tn.esprit.avis.entities.Avis;

import java.util.List;
import java.util.Optional;

public interface    AvisService {

    // Create or update an avis
    Avis addAvis(Avis avis);

    Avis saveAvis(Avis avis);

    // Get all avis
    List<Avis> getAllAvis();

    // Get avis by ID
    Optional<Avis> getAvisById(Long id);

    // Delete avis by ID
    void deleteAvis(Long id);
}
