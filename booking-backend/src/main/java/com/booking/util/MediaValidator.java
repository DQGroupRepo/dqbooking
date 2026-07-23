package com.booking.util;

import com.booking.exception.FileSizeExceededException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Component
public class MediaValidator {

    @Value("${app.upload.image-max-size-mb:5}")
    private long imageMaxSizeMb;

    @Value("${app.upload.video-max-size-mb:50}")
    private long videoMaxSizeMb;


    public void validate(List<MultipartFile> files) {

        for (MultipartFile file : files) {

            if (file.isEmpty()) {
                continue;
            }

            String contentType = file.getContentType();

            if (contentType == null) {
                throw new IllegalArgumentException(
                        "Unable to determine file type."
                );
            }

            long maxSizeMb;

            if (contentType.startsWith("image/")) {

                maxSizeMb = imageMaxSizeMb;

            } else if (contentType.startsWith("video/")) {

                maxSizeMb = videoMaxSizeMb;

            } else {

                throw new IllegalArgumentException(
                        "Only image and video files are allowed."
                );

            }

            long maxSizeBytes =
                    maxSizeMb * 1024 * 1024;

            if (file.getSize() > maxSizeBytes) {

                throw new FileSizeExceededException(
                        file.getOriginalFilename()
                                + " exceeds the maximum allowed size of "
                                + maxSizeMb
                                + " MB."
                );

            }

        }

    }

}