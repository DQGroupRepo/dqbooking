package com.booking.dto.review;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewReplyRequest {

    @NotBlank(message = "Reply is required.")
    private String vendorReply;

}