package tn.esprit.avis.services;

import tn.esprit.avis.entities.Avis;
import tn.esprit.avis.Repositories.AvisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AvisServiceImpl implements AvisService {

    @Autowired
    private AvisRepository avisRepository;

    @Override
    public Avis addAvis(Avis avis) {
        avis.setDateAvis(LocalDateTime.now());
        return avisRepository.save(avis);
    }

    @Override
    public Avis saveAvis(Avis avis) {
        return avisRepository.save(avis);
    }

    @Override
    public List<Avis> getAllAvis() {
        return avisRepository.findAll();
    }

    @Override
    public Optional<Avis> getAvisById(Long id) {
        return avisRepository.findById(id);
    }

    @Override
    public void deleteAvis(Long id) {
        avisRepository.deleteById(id);
    }
}
