package com.example.comp.service;

import com.example.comp.dto.CommentResponse;
import com.example.comp.dto.CreateCommentRequest;
import com.example.comp.dto.QuestionDTO;
import com.example.comp.enums.Difficulty;
import com.example.comp.model.Comment;
import com.example.comp.model.Question;
import com.example.comp.repo.CommentRepository;
import com.example.comp.repo.QuestionRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.example.comp.component.CurrentUser;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepo questionRepo;
    private final CommentRepository commentRepository;
    private final RedisTemplate<String, Object> redis;
    private final CurrentUser currentUser;

    @Cacheable(value = "questions::all")
    public List<QuestionDTO> getAllQuestions() {
        log.info("Fetching all questions from DB");
        return questionRepo.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public QuestionDTO getQuestionDTOById(UUID id) {
        return toDTO(getQuestionById(id));
    }

    public Question getQuestionById(UUID id) {
        String cacheKey = "question::" + id;

        Question cached = (Question) redis.opsForValue().get(cacheKey);
        if (cached != null) {
            return cached;
        }

        Question question = questionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found: " + id));

        redis.opsForValue().set(cacheKey, question);
        return question;
    }

    @CacheEvict(value = "questions::all", allEntries = true)
    public QuestionDTO createQuestion(QuestionDTO dto) {
        Question saved = questionRepo.save(toEntity(dto));
        return toDTO(saved);
    }

    @CacheEvict(value = "questions::all", allEntries = true)
    public QuestionDTO updateQuestion(UUID id, QuestionDTO dto) {

        Question question = getQuestionById(id);

        question.setTitle(dto.getTitle());
        question.setDescription(dto.getDescription());
        question.setStdIn(dto.getStdIn());
        question.setExpectedOutput(dto.getExpectedOutput());
        question.setTags(dto.getTags());

        if (dto.getDifficulty() != null) {
            question.setDifficulty(Difficulty.valueOf(dto.getDifficulty()));
        }

        Question updated = questionRepo.save(question);

        redis.delete("question::" + id);

        return toDTO(updated);
    }

    @CacheEvict(value = "questions::all", allEntries = true)
    public void deleteQuestion(UUID id) {
        questionRepo.deleteById(id);
        redis.delete("question::" + id);
    }

    @Transactional
    @CacheEvict(value = "questions::all", allEntries = true)
    public List<QuestionDTO> bulkCreate(List<QuestionDTO> dtos) {

        List<Question> questions = dtos.stream()
                .map(this::toEntity)
                .toList();

        return questionRepo.saveAll(questions)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    @CacheEvict(value = "questions::all", allEntries = true)
    public List<QuestionDTO> bulkUpdate(List<QuestionDTO> dtos) {

        return dtos.stream()
                .map(dto -> updateQuestion(dto.getId(), dto))
                .toList();
    }

    @Transactional
    @CacheEvict(value = "questions::all", allEntries = true)
    public void bulkDelete(List<UUID> ids) {
        questionRepo.deleteAllById(ids);
        ids.forEach(id -> redis.delete("question::" + id));
    }

    @Transactional
    public CommentResponse create(UUID questionId, CreateCommentRequest request) {

        Question question = getQuestionById(questionId);

        Comment comment = new Comment();
        comment.setContent(request.content());
        comment.setQuestion(question);
        comment.setAuthor(currentUser.get());

        if (request.parentId() != null) {

            Comment parent = commentRepository.findById(request.parentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));

            // prevent cross-question reply attack
            if (!parent.getQuestion().getId().equals(questionId)) {
                throw new RuntimeException("Parent comment does not belong to this question");
            }

            comment.setParent(parent);
        }

        Comment saved = commentRepository.save(comment);
        return mapToResponse(saved);
    }

    public Page<CommentResponse> getComments(UUID questionId, Pageable pageable) {

        Page<Comment> roots = commentRepository.findByQuestionIdAndParentIsNull(questionId, pageable);

        return roots.map(this::mapToResponseWithReplies);
    }

    @Transactional
    public CommentResponse update(UUID questionId, UUID commentId, String content) {

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getQuestion().getId().equals(questionId)) {
            throw new RuntimeException("Comment does not belong to this question");
        }

        comment.setContent(content);

        return mapToResponse(comment);
    }

    @Transactional
    public void delete(UUID questionId, UUID commentId) {

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getQuestion().getId().equals(questionId)) {
            throw new RuntimeException("Comment does not belong to this question");
        }

        commentRepository.delete(comment);
    }

    // =====================================================
    // MAPPERS
    // =====================================================

    private QuestionDTO toDTO(Question question) {

        QuestionDTO dto = new QuestionDTO();

        dto.setId(question.getId());
        dto.setTitle(question.getTitle());
        dto.setDescription(question.getDescription());
        dto.setStdIn(question.getStdIn());
        dto.setExpectedOutput(question.getExpectedOutput());
        dto.setTags(question.getTags());

        if (question.getDifficulty() != null) {
            dto.setDifficulty(question.getDifficulty().name());
        }

        return dto;
    }

    private Question toEntity(QuestionDTO dto) {

        Question question = new Question();

        question.setId(dto.getId());
        question.setTitle(dto.getTitle());
        question.setDescription(dto.getDescription());
        question.setStdIn(dto.getStdIn());
        question.setExpectedOutput(dto.getExpectedOutput());
        question.setTags(dto.getTags());

        if (dto.getDifficulty() != null) {
            question.setDifficulty(Difficulty.valueOf(dto.getDifficulty()));
        }

        return question;
    }

    private CommentResponse mapToResponse(Comment comment) {
        String authorName = comment.getAuthor() != null ? comment.getAuthor().getUsername() : "Unknown";
        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                authorName,
                comment.getParent() != null ? comment.getParent().getId() : null,
                comment.getCreatedAt(),
                List.of());
    }

    private CommentResponse mapToResponseWithReplies(Comment comment) {

        List<CommentResponse> replies = comment.getReplies()
                .stream()
                .map(this::mapToResponseWithReplies)
                .collect(Collectors.toList());

        String authorName = comment.getAuthor() != null ? comment.getAuthor().getUsername() : "Unknown";
        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                authorName,
                comment.getParent() != null ? comment.getParent().getId() : null,
                comment.getCreatedAt(),
                replies);
    }
}