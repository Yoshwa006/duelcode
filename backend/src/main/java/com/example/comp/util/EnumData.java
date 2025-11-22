package com.example.comp.util;

public enum EnumData {
    STATUS_ACTIVE("active"),
    STATUS_PLAYING("playing"),
    STATUS_COMPLETED("completed");

    private final String value;

    EnumData(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
