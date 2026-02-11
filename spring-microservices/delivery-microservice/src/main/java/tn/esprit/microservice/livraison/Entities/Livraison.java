package tn.esprit.microservice.livraison.Entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
public class Livraison {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_livraison")
    private int idLivraison;

    @Column(name = "date_livraison")
    private LocalDate dateLivraison;

    @Column(name = "statut")
    private String statut; // En préparation, Expédiée, Livrée, Retardée

    @Column(name = "adresse_livraison")
    private String adresseLivraison;

    @Column(name = "frais_livraison")
    private BigDecimal fraisLivraison;

    public int getIdLivraison() {
        return idLivraison;
    }

    public void setIdLivraison(int idLivraison) {
        this.idLivraison = idLivraison;
    }

    public LocalDate getDateLivraison() {
        return dateLivraison;
    }

    public void setDateLivraison(LocalDate dateLivraison) {
        this.dateLivraison = dateLivraison;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public String getAdresseLivraison() {
        return adresseLivraison;
    }

    public void setAdresseLivraison(String adresseLivraison) {
        this.adresseLivraison = adresseLivraison;
    }

    public BigDecimal getFraisLivraison() {
        return fraisLivraison;
    }

    public void setFraisLivraison(BigDecimal fraisLivraison) {
        this.fraisLivraison = fraisLivraison;
    }

    public Livraison() {
    }

    public Livraison(LocalDate dateLivraison, String statut, String adresseLivraison, BigDecimal fraisLivraison) {
        this.dateLivraison = dateLivraison;
        this.statut = statut;
        this.adresseLivraison = adresseLivraison;
        this.fraisLivraison = fraisLivraison;
    }
}

