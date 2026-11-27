package com.maco.ai.fallback;

import com.maco.ai.dto.GradeOutput;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.List;

/**
 * 사진의 밝기·선명도를 AI 없이 계산한다 (prototype/lib/ai/adapter.ts judgePhoto).
 * 밝기: 평균 휘도 0~255, 선명도: 라플라시안 평균.
 */
public final class PhotoMetrics {

    // 가정값: 통과 기준 (docs/07 4장)
    public static final double MIN_BRIGHTNESS = 85;
    public static final double MAX_BRIGHTNESS = 215;
    public static final double MIN_SHARPNESS = 6;

    private PhotoMetrics() {
    }

    public record Measured(double brightness, double sharpness) {
    }

    public static Measured measure(BufferedImage img) {
        int w = img.getWidth();
        int h = img.getHeight();
        double[] lum = new double[w * h];
        double sum = 0;
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int rgb = img.getRGB(x, y);
                double l = 0.299 * ((rgb >> 16) & 0xff) + 0.587 * ((rgb >> 8) & 0xff) + 0.114 * (rgb & 0xff);
                lum[y * w + x] = l;
                sum += l;
            }
        }
        double edge = 0;
        for (int y = 1; y < h - 1; y++) {
            for (int x = 1; x < w - 1; x++) {
                int i = y * w + x;
                edge += Math.abs(4 * lum[i] - lum[i - 1] - lum[i + 1] - lum[i - w] - lum[i + w]);
            }
        }
        double sharp = (w > 2 && h > 2) ? edge / ((double) (w - 2) * (h - 2)) : 0;
        return new Measured(sum / (w * (double) h), sharp);
    }

    public static GradeOutput judge(double brightness, double sharpness) {
        boolean darkOk = brightness >= MIN_BRIGHTNESS;
        boolean overOk = brightness <= MAX_BRIGHTNESS;
        boolean sharpOk = sharpness >= MIN_SHARPNESS;
        List<GradeOutput.Check> checks = List.of(
                new GradeOutput.Check("BRIGHT", "밝기", darkOk && overOk),
                new GradeOutput.Check("SHARP", "선명도", sharpOk));
        boolean pass = darkOk && overOk && sharpOk;
        String good = pass ? "밝기와 선명도가 모두 좋아요." : darkOk && overOk ? "밝기는 좋아요." : sharpOk ? "초점은 잘 맞았어요." : "다시 찍어 볼 준비가 됐어요.";
        String fix = !darkOk ? "조금 어두워요. 창가 자연광에서 다시 찍어 보세요."
                : !overOk ? "너무 밝아요. 햇빛이 직접 닿지 않는 자리로 옮겨 보세요."
                : !sharpOk ? "살짝 흔들렸어요. 팔꿈치를 테이블에 대고 찍어 보세요." : null;
        List<String> errors = new ArrayList<>();
        if (!darkOk || !overOk) errors.add("PHOTO_LIGHT");
        if (!sharpOk) errors.add("PHOTO_BLUR");
        return new GradeOutput(pass ? 100 : (darkOk && overOk) || sharpOk ? 50 : 0, pass, checks, good, fix, errors);
    }
}
