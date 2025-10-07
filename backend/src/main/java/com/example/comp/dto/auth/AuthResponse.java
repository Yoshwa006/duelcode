package com.example.comp.dto.auth;

import lombok.Data;

@Data
public class AuthResponse {

    String token;
    boolean valid;
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setValid(boolean valid){
        this.valid = valid;
    }

    public boolean getValid(){
        return valid;
    }
    
}
