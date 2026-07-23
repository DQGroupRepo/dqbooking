package com.booking.service.storage;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StorageService {

    List<String> upload(
            List<MultipartFile> file, String folder
    );

    void delete(
            String fileUrl
    );

}