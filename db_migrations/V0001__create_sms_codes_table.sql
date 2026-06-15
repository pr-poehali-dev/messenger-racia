CREATE TABLE IF NOT EXISTS t_p40060251_messenger_racia.sms_codes (
    phone VARCHAR(15) PRIMARY KEY,
    code VARCHAR(6) NOT NULL,
    expires_at BIGINT NOT NULL,
    created_at BIGINT NOT NULL
);