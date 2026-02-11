package tn.esprit.avis.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "avis")
public class Avis {

    @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "utilisateur_id", nullable = false)
    private Long utilisateurId;

    @Column(name = "livreur_id", nullable = false)
    private Long livreurId;

    private int note;

    private String commentaire;

    @Column(name = "date_avis")
    private LocalDateTime dateAvis;

    // Constructor vide obligatoire
    public Avis() {
    }

    // Getter & Setter for utilisateurId
    public Long getUtilisateurId() {
        return utilisateurId;
    }

    public void setUtilisateurId(Long utilisateurId) {
        this.utilisateurId = utilisateurId;
    }

    // Getter & Setter for livreurId
    public Long getLivreurId() {
        return livreurId;
    }

    public void setLivreurId(Long livreurId) {
        this.livreurId = livreurId;
    }

    // Getter & Setter for note
    public int getNote() {
        return note;
    }

    public void setNote(int note) {
        this.note = note;
    }

    // Getter & Setter for commentaire
    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    // Getter & Setter for dateAvis
    public LocalDateTime getDateAvis() {
        return dateAvis;
    }

    public void setDateAvis(LocalDateTime dateAvis) {
        this.dateAvis = dateAvis;
    }
}
