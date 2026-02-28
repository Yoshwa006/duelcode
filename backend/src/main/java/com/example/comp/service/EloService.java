package com.example.comp.service;

import com.example.comp.enums.EloResult;
import org.springframework.stereotype.Service;

@Service
public class EloService {

    private static final int K = 32;

    public EloResult calculate(int winnerElo, int loserElo) {

        double expectedWin =
                1.0 / (1 + Math.pow(10, (loserElo - winnerElo) / 400.0));

        int newWinner = (int) (winnerElo + K * (1 - expectedWin));
        int newLoser  = (int) (loserElo + K * (0 - (1 - expectedWin)));

        return new EloResult(newWinner, newLoser);
    }
}
