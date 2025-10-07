package com.example.comp.model;


import jakarta.persistence.*;

@Entity
@Table(name = "session")
public class Session {


    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private int id;
    private int createdBy;
    @Column(nullable = false, unique = true)
    private String token;
    private int joinedBy;
    private int who_won;
    private int question_id;

    public Session(String token, int createdBy, int questionId) {
        this.token = token;
        this.createdBy = createdBy;
        this.question_id = questionId;
    }

    public int getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(int createdBy) {
        this.createdBy = createdBy;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public int getJoinedBy() {
        return joinedBy;
    }

    public void setJoinedBy(int joinedBy) {
        this.joinedBy = joinedBy;
    }

    public int getWho_won() {
        return who_won;
    }

    public void setWho_won(int who_won) {
        this.who_won = who_won;
    }

    public int getQuestion_id() {
        return question_id;
    }

    public void setQuestion_id(int question_id) {
        this.question_id = question_id;
    }


}
