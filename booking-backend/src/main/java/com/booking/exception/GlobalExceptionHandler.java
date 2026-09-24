package com.booking.exception;

import com.booking.dto.common.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex) {

        ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                LocalDateTime.now()
        );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(error);
    }


    /*
     * =========================================
     * ACCESS DENIED
     * =========================================
     *
     * Authenticated user attempted an operation
     * for which they do not have permission.
     *
     * This is intentionally HTTP 403 and must
     * NOT be treated as an authentication failure.
     */

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex
    ) {

        String message =
                ex.getMessage();

        if (
                message == null ||
                        message.isBlank()
        ) {

            message =
                    "You do not have permission to perform this action.";

        }


        ErrorResponse errorResponse =
                new ErrorResponse(
                        HttpStatus.FORBIDDEN.value(),
                        message,
                        LocalDateTime.now()
                );


        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(errorResponse);

    }


    @ExceptionHandler(FileSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleFileSizeExceeded(
            FileSizeExceededException ex
    ) {

        ErrorResponse errorResponse =
                new ErrorResponse(
                        HttpStatus.PAYLOAD_TOO_LARGE.value(),
                        ex.getMessage(),
                        LocalDateTime.now()
                );


        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(errorResponse);

    }


    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(
            MaxUploadSizeExceededException ex
    ) {

        ErrorResponse errorResponse =
                new ErrorResponse(
                        HttpStatus.PAYLOAD_TOO_LARGE.value(),
                        ex.getMessage(),
                        LocalDateTime.now()
                );


        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(errorResponse);

    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(
            IllegalStateException ex
    ) {

        ErrorResponse error =
                new ErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        ex.getMessage(),
                        LocalDateTime.now()
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(error);
    }
}