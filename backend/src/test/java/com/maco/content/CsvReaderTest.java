package com.maco.content;

import static org.assertj.core.api.Assertions.assertThat;

import com.maco.content.loader.CsvReader;
import com.maco.content.loader.ItemChoices;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class CsvReaderTest {

    @Test
    void 따옴표_안의_쉼표_줄바꿈_큰따옴표를_읽는다() {
        String csv = "code,prompt\nA,\"첫 줄\n둘째 줄, 쉼표 \"\"인용\"\"\"\nB,짧음\n";

        List<Map<String, String>> rows = CsvReader.read(csv);

        assertThat(rows).hasSize(2);
        assertThat(rows.get(0).get("prompt")).isEqualTo("첫 줄\n둘째 줄, 쉼표 \"인용\"");
        assertThat(rows.get(1).get("code")).isEqualTo("B");
    }

    @Test
    void 빈_파일은_빈_목록() {
        assertThat(CsvReader.read("")).isEmpty();
    }

    @Test
    void 보기_열을_choices_json_형식으로_바꾼다() {
        Map<String, String> row = Map.of("choice_a", "photo:s=latte;light=dark", "choice_b", "글 보기",
                "error_a", "PHOTO_LIGHT", "choice_c", "");

        List<Map<String, String>> choices = ItemChoices.fromRow(row);

        assertThat(choices).hasSize(2);
        assertThat(choices.get(0)).containsEntry("key", "A").containsEntry("image", "photo:s=latte;light=dark")
                .containsEntry("errorType", "PHOTO_LIGHT");
        assertThat(choices.get(1)).containsEntry("text", "글 보기").doesNotContainKey("errorType");
    }
}
