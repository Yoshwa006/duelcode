package com.example.comp.repo;

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

        if (request.getCreatorEmail() != null && !request.getCreatorEmail().trim().isEmpty()) {
            predicates.add(cb.equal(creator.get("email"), request.getCreatorEmail()));
        }
        if (request.getCreatedUserName() != null && !request.getCreatedUserName().trim().isEmpty()) {
            predicates.add(cb.equal(creator.get("email"), request.getCreatedUserName())); // Users doesn't have 'name', using email
        }
        if (request.getJoinedUserName() != null && !request.getJoinedUserName().trim().isEmpty()) {
            predicates.add(cb.equal(joiner.get("email"), request.getJoinedUserName())); // Users doesn't have 'name', using email
        }
        if(request.getJoinedByEmail() != null && !request.getJoinedByEmail().trim().isEmpty()){
            predicates.add(cb.equal(joiner.get("email"), request.getJoinedByEmail()));
        }
        if (request.getDifficulty() != null && !request.getDifficulty().trim().isEmpty()) {
            predicates.add(cb.equal(question.get("difficulty"), request.getDifficulty()));
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            predicates.add(cb.equal(session.get("status"), request.getStatus()));
        }
        if (request.getStartDate() != null && !request.getStartDate().trim().isEmpty()) {
            try {
                predicates.add(cb.greaterThanOrEqualTo(
                        session.get("createdAt"),
                        Instant.parse(request.getStartDate())
                ));
            } catch (Exception e) {
                // Invalid date format, skip this predicate
            }
        }
        if (request.getEndDate() != null && !request.getEndDate().trim().isEmpty()) {
            try {
                predicates.add(cb.lessThanOrEqualTo(
                        session.get("createdAt"),
                        Instant.parse(request.getEndDate())
                ));
            } catch (Exception e) {
                // Invalid date format, skip this predicate
            }
        }

        cq.where(predicates.toArray(new Predicate[0]));

        String sortBy = request.getSortBy() != null ? request.getSortBy() : "createdAt";
        if (request.getDirection() != null && request.getDirection().equalsIgnoreCase("desc")) {
            cq.orderBy(cb.desc(session.get(sortBy)));
        } else {
            cq.orderBy(cb.asc(session.get(sortBy)));
        }

        TypedQuery<Session> query = em.createQuery(cq);

        // Add pagination
        int page = request.getPage() != null && request.getPage() >= 0 ? request.getPage() : 0;
        int size = request.getSize() != null && request.getSize() > 0 ? request.getSize() : 10;
        query.setFirstResult(page * size);
        query.setMaxResults(size);

        return query.getResultList();
    }
}

