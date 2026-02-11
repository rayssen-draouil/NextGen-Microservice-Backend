package tn.esprit.microservice.livraison.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.microservice.livraison.Entities.Livraison;
import tn.esprit.microservice.livraison.Repositories.LivraisonRepository;

import java.util.List;
import java.util.Optional;

@Service
public class LivraisonService {
    @Autowired
    private LivraisonRepository livraisonRepository;

    public List<Livraison> findAll(){
        return livraisonRepository.findAll();
    }

    public Optional<Livraison> findById(int id){
        return livraisonRepository.findById(id);
    }

    public List<Livraison> getAll(){
        return livraisonRepository.findAll();
    }

    public Livraison addLivraison(Livraison livraison){
        return livraisonRepository.save(livraison);
    }

    public Livraison updateLivraison(int id, Livraison newLivraison){
        if (livraisonRepository.findById(id).isPresent()) {
            Livraison existingLivraison = livraisonRepository.findById(id).get();
            existingLivraison.setDateLivraison(newLivraison.getDateLivraison());
            existingLivraison.setStatut(newLivraison.getStatut());
            existingLivraison.setAdresseLivraison(newLivraison.getAdresseLivraison());
            existingLivraison.setFraisLivraison(newLivraison.getFraisLivraison());
            return livraisonRepository.save(existingLivraison);
        } else
            return null;
    }

    public String deleteLivraison(int id) {
        if (livraisonRepository.findById(id).isPresent()) {
            livraisonRepository.deleteById(id);
            return "livraison supprimée";
        } else
            return "livraison non supprimée";
    }
}

