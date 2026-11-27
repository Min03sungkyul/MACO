package com.maco.store.service;

import com.maco.common.api.BusinessException;
import com.maco.common.api.ErrorCode;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * 캡처·미션 사진 저장 (S3 대신 서버 디스크 UPLOAD_DIR). 형식·용량 검사, 긴 변 1568px 이하로 줄여 PNG로 저장.
 */
@Service
public class UploadService {

    public static final int MAX_SIDE = 1568;          // AI 이미지 입력 권장 크기 (docs/01 5-4)
    public static final long MAX_BYTES = 10L * 1024 * 1024;
    private static final Set<String> TYPES = Set.of("image/jpeg", "image/png");

    private final Path root;

    public UploadService(@Value("${maco.upload-dir:./uploads}") String uploadDir) {
        this.root = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public record Saved(String path, BufferedImage image) {
    }

    public Saved save(MultipartFile file, String folder) {
        if (file == null || file.isEmpty() || file.getSize() > MAX_BYTES || !TYPES.contains(file.getContentType())) {
            throw new BusinessException(ErrorCode.FILE_INVALID);
        }
        try (InputStream in = file.getInputStream()) {
            BufferedImage img = ImageIO.read(in);
            if (img == null) {
                throw new BusinessException(ErrorCode.FILE_INVALID);
            }
            BufferedImage resized = shrink(img);
            Path dir = root.resolve(folder);
            Files.createDirectories(dir);
            Path out = dir.resolve(UUID.randomUUID() + ".png");
            ImageIO.write(resized, "png", out.toFile());
            return new Saved(root.relativize(out).toString().replace('\\', '/'), resized);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_INVALID);
        }
    }

    static BufferedImage shrink(BufferedImage img) {
        int w = img.getWidth();
        int h = img.getHeight();
        int longest = Math.max(w, h);
        if (longest <= MAX_SIDE) {
            return img;
        }
        double scale = MAX_SIDE / (double) longest;
        int nw = (int) Math.round(w * scale);
        int nh = (int) Math.round(h * scale);
        BufferedImage out = new BufferedImage(nw, nh, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(img, 0, 0, nw, nh, null);
        g.dispose();
        return out;
    }
}
