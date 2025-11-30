package com.example.comp.service;

import com.example.comp.dto.SessionSearchRequestDTO;
import com.example.comp.model.Question;
import com.example.comp.model.Session;
import com.example.comp.model.Users;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Repository
public class CustomSessionRepository {
    @PersistenceContext
    EntityManager em;

    public List<Session> searchSessions(SessionSearchRequestDTO request) {

        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Session> cq = cb.createQuery(Session.class);

        Root<Session> session = cq.from(Session.class);

        Join<Session, Users> creator = session.join("createdBy", JoinType.LEFT);
        Join<Session, Users> joiner = session.join("joinedBy", JoinType.LEFT);
        Join<Session, Question> question = session.join("question", JoinType.LEFT);

        List<Predicate> predicates = new ArrayList<>();

        if (request.getCreatorEmail() != null) {
            predicates.add(cb.equal(creator.get("email"), request.getCreatorEmail()));
        }
        if (request.getCreatedUserName() != null) {
            predicates.add(cb.equal(creator.get("name"), request.getCreatedUserName()));
        }
        if (request.getJoinedUserName() != null) {
            predicates.add(cb.equal(joiner.get("name"), request.getJoinedUserName()));
        }
        if (request.getDifficulty() != null) {
            predicates.add(cb.equal(question.get("difficulty"), request.getDifficulty()));
        }
        if (request.getStatus() != null) {
            predicates.add(cb.equal(session.get("status"), request.getStatus()));
        }
        if (request.getStartDate() != null) {
            predicates.add(cb.greaterThanOrEqualTo(
                    session.get("createdAt"),
                    Instant.parse(request.getStartDate())
            ));
        }
        if (request.getEndDate() != null) {
            predicates.add(cb.lessThanOrEqualTo(
                    session.get("createdAt"),
                    Instant.parse(request.getEndDate())
            ));
        }

        cq.where(predicates.toArray(new Predicate[0]));

        if (request.getDirection().equalsIgnoreCase("desc")) {
            cq.orderBy(cb.desc(session.get(request.getSortBy())));
        } else {
            cq.orderBy(cb.asc(session.get(request.getSortBy())));

        }

        TypedQuery<Session> query = em.createQuery(cq);

        return query.getResultList();
    }
}
