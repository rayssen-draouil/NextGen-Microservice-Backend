package tn.esprit.avis.Repositories;

import tn.esprit.avis.entities.Avis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface    AvisRepository extends JpaRepository<Avis, Long> {

    // CREATE / UPDATE
    Avis save(Avis avis);

    // READ ALL
    List<Avis> findAll();

    // READ BY ID
    Optional<Avis> findById(Long id);

    // DELETE
    void deleteById(Long id);
}
