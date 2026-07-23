package com.booking.controller;

import com.booking.service.storage.StorageService;
import com.booking.util.MediaValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final StorageService storageService;
    private final MediaValidator mediaValidator;

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public List<String> uploadImages(@RequestParam("files")
                              List<MultipartFile> files

    ) {
        mediaValidator.validate(files);
        return storageService.upload(files, "");

    }

}