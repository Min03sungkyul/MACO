---
name: maco-pr
description: MACO에서 작업을 마치고 커밋하거나 PR(Pull Request)을 준비할 때 쓴다. 검사 실행, 변경 확인, 커밋 메시지, PR 설명 작성까지.
---

# 커밋·PR 준비

1. **검사 실행** (실제로 실행하고 결과를 사용자에게 보여 준다)
   - 바뀐 곳이 backend면 `./gradlew test`
   - 바뀐 곳이 frontend면 `npm run lint`, `npm run build`
   - 항상 `node scripts/check-rules.mjs`
   - 실패하면 고치고 다시 실행한다. 고칠 수 없으면 무엇이 실패했는지 그대로 말한다.
2. **변경 확인**: `git status`, `git diff`로 바뀐 파일을 보고 다음을 확인한다.
   - 담당 영역 밖 파일이 없는가 (있으면 PR 설명에 적기)
   - `.env`, 키, 개인 메모, 임시 파일이 없는가
   - 디버그용 출력(`System.out.println`, `console.log`)이 남아 있지 않은가
3. **커밋**: `git add <파일들>` (전체 `git add .`보다 파일 지정) → `git commit -m "feat(<탭>): <한국어 설명>"`.
4. **PR 설명 초안**: `.github/pull_request_template.md` 형식으로 작성해 사용자에게 보여 준다. 기능 ID(예: T1), 확인 방법, AI 사용 기록을 채운다.
5. **push·PR 생성은 사용자가 요청할 때만** 한다. GitHub Desktop을 쓰는 사람에게는 "Push origin → Create Pull Request" 버튼 순서를 알려 준다.
6. 리뷰어: 팀원(주승준·박민하·이동성)의 PR은 팀장 강민국(`@Min03sungkyul`)이 CODEOWNERS로 자동 지정된다. 강민국 본인의 PR은 리뷰 없이 병합할 수 있다. 다른 담당 영역을 고쳤으면 PR 설명에 적고 그 담당자에게도 알린다.
