// 게임 설정
const GAME_CONFIG = {
    textSpeed: 30,      // 텍스트 타이핑 속도 (ms) - 낮을수록 빠름
    autoDelay: 2000,    // 오토 모드에서 다음으로 넘어가는 딜레이 (ms)
    skipSpeed: 5,       // 스킵 모드 텍스트 속도 (ms)
};

const SCRIPT = [
    // -----------------------------------------------------------
    // 1. 인트로 (프레젠테이션 소개)
    // -----------------------------------------------------------
    {
        id: 1,
        bgm: "bgm/Main_theme.mp3",
        text: "Project UT Playable Presentation",
    },
    {
        id: 2,
        background: "Background/Daytime.png",
        bgm: "bgm/Main_theme.mp3",
        name: "???",
        text: "프로젝트 UT에 오신 것을 환영합니다.<br>이렇게 저희의 프레젠테이션을 플레이 해주셔서 감사합니다.",
        boxOpacity: 0.7,
    },
    {
        id: 3,
        name: "???",
        text: "저희는 단순히 PPT를 만들기보단 플레이가 가능하도록 만들었습니다.<br>저희는 비주얼 노벨 프로젝트를 만드려고 하고 있고, 특히 미연시 장르를 만들 계획입니다.",
        boxOpacity: 0.7,
    },
    {
        id: 4,
        name: "???",
        text: "다양한 종족이 어우러져 함께 살아가는 이 세계에서<br>바텐더가 되어 히로인들의 상담을 들어주며, 서로를 알아가고<br>더 깊은 관계로 나아지는 게임입니다.",
        boxOpacity: 0.7,
    },
    {
        id: 5,
        name: "???",
        text: "설명은 여기까지입니다.<br>이제, 당신의 가게로 안내하겠습니다.",
        boxOpacity: 0.7,
    },

    // -----------------------------------------------------------
    // 2. 바(Bar) 입장 및 오프닝
    // -----------------------------------------------------------
    {
        id: 6,
        background: "Background/Bar.png",
        name: "???",
        text: "도시는 시끄럽지만, 이곳은 고요하다.<br>나는 술을 팔지만, 손님들은 위로를 사러 온다.",
        boxOpacity: 0.7,
    },
    {
        id: 7,
        name: "???",
        text: "단골들만 알음알음 찾아오던 나의 작은 바.",
        boxOpacity: 0.7,
    },
    {
        id: 8,
        name: "???",
        text: "하지만 요 며칠 사이, 조금 특별한 손님들이 문을 두드리기 시작했다.",
        boxOpacity: 0.7,
    },

    // -----------------------------------------------------------
    // 3. 캐릭터 선택 분기점
    // -----------------------------------------------------------
    {
        id: 9,
        characters: {
            left: "Character/Elf.png",
            center: "Character/Rabbit.png",
            right: "Character/Vamp.png",
        },
        // 모든 선택지(once)가 소진되면 자동으로 이쪽으로 넘어갑니다.
        nextId: 13,
        choices: [
            { text: "엘프", nextId: 10, y: 300, target: "left", once: true },
            { text: "토끼 수인", nextId: 11, y: 300, target: "center", once: true },
            { text: "뱀파이어", nextId: 12, y: 300, target: "right", once: true }
        ]
    },

    // -----------------------------------------------------------
    // 4. 엘프 루트
    // -----------------------------------------------------------
    {
        id: 10,
        characters: {
            center: "Character/Elf.png",
        },
        name: "에일린 사파이어",
        text: "에일린 사파이어. 중앙 수사대의 시니어 검사입니다.",
        nextId: 101,
    },
    {
        id: 101,
        characters: {
            center: "Character/Elf.png",
        },
        name: "에일린 사파이어",
        text: "외견은 30대 초반으로 보이지만, 실제로는 150세가 넘는 엘프입니다.<br>격무에 시달려 셔츠 단추를 풀거나 소매를 걷어붙인 모습이 반전 매력을 줍니다.",
        nextId: 102,
    },
    {
        id: 102,
        characters: {
            center: "Character/Elf.png",
        },
        name: "에일린 사파이어",
        text: "\"꼬맹이, 이런 건 애들이나 마시는 거야.\"<br>그녀는 당신을 아이 취급하며 여유롭게 대하곤 합니다.",
        nextId: 103,
    },
    {
        id: 103,
        characters: {
            center: "Character/Elf.png",
        },
        name: "에일린 사파이어",
        text: "하지만 범죄와 거짓말에 지친 그녀에게,<br>당신의 정직하고 소소한 이야기는 유일한 안식이 될 것입니다.",
        // 다시 선택지로 돌아가서 다른 캐릭터도 볼 수 있게 함
        nextId: 9,
    },

    // -----------------------------------------------------------
    // 5. 토끼 수인 루트
    // -----------------------------------------------------------
    {
        id: 11,
        characters: {
            center: "Character/Rabbit.png",
        },
        name: "베일리 루아",
        text: "베일리 루아. 마케팅팀의 신입 사원인 토끼 수인입니다.",
        nextId: 111,
    },
    {
        id: 111,
        characters: {
            center: "Character/Rabbit.png",
        },
        name: "베일리 루아",
        text: "20대 초반의 사회 초년생으로, 커다란 코트 속에 파묻힌 슬렌더한 체형이 특징이죠.<br>감정에 따라 움직이는 긴 귀와, 격무로 부스스해진 머리가 눈에 띕니다.",
        nextId: 112,
    },
    {
        id: 112,
        characters: {
            center: "Character/Rabbit.png",
        },
        name: "베일리 루아",
        text: "\"저기요... 여기서 제일 달콤한 걸로 주시겠어요?\"<br>실수투성이 업무에 지친 그녀는 이곳을 유일한 안식처로 삼고 있습니다.",
        nextId: 113,
    },
    {
        id: 113,
        characters: {
            center: "Character/Rabbit.png",
        },
        name: "베일리 루아",
        text: "술도 모르는 순진한 그녀가 당신의 응원을 통해<br>멋진 커리어 우먼으로 성장해가는 모습을 지켜봐 주세요.",
        // 다시 선택지로 돌아가서 다른 캐릭터도 볼 수 있게 함
        nextId: 9,
    },

    // -----------------------------------------------------------
    // 6. 뱀파이어 루트
    // -----------------------------------------------------------
    {
        id: 12,
        characters: {
            center: "Character/Vamp.png",
        },
        name: "리샤르 루마니 에네시",
        text: "리샤르 루마니 에네시. 귀족 가문의 뱀파이어이자 재벌집 막내딸입니다.",
        nextId: 121,
    },
    {
        id: 121,
        characters: {
            center: "Character/Vamp.png",
        },
        name: "리샤르 루마니 에네시",
        text: "창백한 피부와 붉은 눈동자, 기품 넘치는 의상이 신비로운 분위기를 자아내죠.<br>하지만 실상은 버킷리스트를 위해 이곳을 찾은 엉뚱한 4차원 아가씨입니다.",
        nextId: 122,
    },
    {
        id: 122,
        characters: {
            center: "Character/Vamp.png",
        },
        name: "리샤르 루마니 에네시",
        text: "\"이게... 서민의 맛인가요?\"<br>세상 물정 모르는 그녀는 엉뚱한 말로 당신을 당황시키지만, 그 속엔 진지함이 담겨 있습니다.",
        nextId: 123,
    },
    {
        id: 123,
        characters: {
            center: "Character/Vamp.png",
        },
        name: "리샤르 루마니 에네시",
        text: "온실 속 화초 같던 그녀가 당신을 만나 진정한 자아를 찾고,<br>집안의 반대를 무릅쓰며 당신을 선택하는 드라마틱한 이야기를 기대해 주세요.",
        // 다시 선택지로 돌아가서 다른 캐릭터도 볼 수 있게 함
        nextId: 9,
    },

    // -----------------------------------------------------------
    // 7. 엔딩 및 모집 (Final Part)
    // -----------------------------------------------------------
    {
        id: 13,
        // 여기서 200번으로 넘어가면서 엔딩 시퀀스 시작
        nextId: 200,
        text: "저마다의 갈증을 안고, 그들은 이곳으로 모여듭니다.",
    },
    {
        id: 200,
        background: "Background/Nighttime.png", // [수정] Bar_Night.png -> Nighttime.png (존재하는 파일로 변경)
        characters: {
            center: "Character/Ending.png",
        },
        name: "서진호 (PD)",
        text: "지금까지 <Project UT>가 그려갈 세계의 시작을 보여드렸습니다.<br>이곳은 단순한 바가 아니라, 위로와 교감이 있는 공간입니다.",
        nextId: 201,
    },
    {
        id: 201,
        characters: {
            center: "Character/Ending.png",
        },
        name: "Team R+19",
        text: "하지만 이 이야기를 완성하기 위해서는<br>더 많은 '바텐더'와 '설계자'가 필요합니다.",
        nextId: 202,
    },
    {
        id: 202,
        characters: {
            center: "Character/Ending.png",
        },
        name: "Recruit",
        text: "시나리오, 아트, 그리고 개발까지.<br>저희와 함께 이 매혹적인 도시의 밤을 완성해주실 분을 찾습니다.",
        nextId: 203,
    },
    {
        id: 203,
        background: "Background/Nighttime.png", // [수정] 검은 배경 파일이 없으므로 야경으로 대체 (또는 삭제 가능)
        characters: {
            center: "Character/Ending.png",
        },
        name: "",
        // 중앙 정렬 엔딩 크레딧 - 높이 문제(잘림) 해결을 위해 줄바꿈 줄이고 폰트/줄간격 조정
        text: "<div style='text-align:center; font-size:1.0em; line-height:1.5;'>게임을 플레이해주셔서 감사합니다.<br>- Team R+19 -</div>",
        boxOpacity: 0.9, // 투명도가 너무 낮아(0.3) 안 보이는 문제 해결
        instant: true, // 텍스트 한 번에 출력
        // nextId 없음 -> 게임 종료
    }
];

// 스크립트 맵 생성 (엔진 구동용 필수 코드)
const SCRIPT_MAP = {};
SCRIPT.forEach((item, index) => {
    SCRIPT_MAP[item.id] = { ...item, _index: index };
});
