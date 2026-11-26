# 내 냉장고 일정표

큰 글씨와 넉넉한 터치 영역을 갖춘 식재료 일정표 및 요리 추천 웹앱입니다.

## 실행하기

`index.html` 파일을 웹 브라우저에서 열면 사용할 수 있습니다. 식재료는 현재 브라우저의 로컬 저장소에 저장됩니다.

## 주요 기능

- 월간 소비기한 달력과 날짜별 식재료 보기
- 보관 위치와 소비기한을 지정해 재료 등록
- 사용 완료 처리와 냉장고 보유 현황
- 보유 재료 및 임박 재료 기반 요리 추천
- 큰 글씨 보기와 한국어 음성 읽어주기

여러 기기 간 동기화, 실제 알림 전송, 음성 재료 입력에는 별도의 백엔드 연동이 필요합니다.

## 추천 요리와 보관 기간

- 추천 요리를 확장했으며 각 요리 카드에서 참고한 원 레시피를 확인할 수 있습니다. 조리 단계는 앱용으로 요약·재작성했습니다.
- 보관 날짜는 식품안전나라, FoodSafety.gov, NHS, 대학 Extension 자료 등을 기준으로 알려진 식품에 한해 자동 제안합니다.
- 제품 포장에 적힌 보관 방법과 소비기한을 우선합니다. 미개봉·개봉, 생식·조리 여부, 실제 냉장고 온도와 보관 상태에 따라 기간이 달라질 수 있습니다.
- 출처가 특정 조건의 기간을 제시하지 않거나 식품 상태가 불분명하면 기간을 임의로 추정하지 않고 직접 날짜를 입력하도록 안내합니다.
- 냉동 기간은 계속 -18℃ 이하를 유지했을 때의 품질 권장기간을 중심으로 안내합니다. 냉동·해동 반복은 피하고, 변질 징후가 있거나 보관 이력이 불확실하면 섭취하지 마세요.

### 참고 자료

- [식품안전나라: 식품 종류별 냉장 보관 권장 시간](https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs001&menu_grp=MENU_NEW01&menu_no=3120&ntctxt_no=21793)
- [식품안전나라: 냉동 보관 방법 및 권장 기간](https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs001&menu_no=3120&ntctxt_no=21795)
- [FoodSafety.gov: 냉장·냉동 보관 차트](https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts)
- [NHS: 지은 밥의 안전한 보관](https://www.nhs.uk/live-well/eat-well/food-types/starchy-foods-and-carbohydrates/)
- [Oregon State University Extension: 두부 보관 안내](https://extension.oregonstate.edu/ask-extension/featured/does-tofu-expire)
- [University of Minnesota Extension: 과일·채소 저장 조건과 예상 기간](https://extension.umn.edu/agriculture/specialty-crops/commercial-fruit-production/postharvest-handling-of-fruit-and-vegetable-crops-in-minnesota)
- [캐나다 보건부: 새싹채소 보관과 조리 안전](https://www.canada.ca/en/health-canada/services/food-safety-fruits-vegetables/sprouts.html)
- [AP News: 과일·채소를 더 오래 보관하는 방법](https://apnews.com/article/8eb3ec0339897d26c0785da338ff3191)
- [Maangchi: 한국 요리 레시피](https://www.maangchi.com/recipes)
