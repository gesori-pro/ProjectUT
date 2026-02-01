/**
 * ========================================
 * Visual Novel Engine
 * ========================================
 * 게임 로직을 담당하는 파일입니다.
 * 일반적으로 이 파일은 수정할 필요가 없습니다.
 * 대사나 이미지는 script-data.js에서 수정하세요!
 */

class VisualNovelEngine {
    constructor() {
        // DOM 요소들
        this.gameContainer = document.getElementById('game-container');
        this.background = document.getElementById('background');
        this.backgroundNext = document.getElementById('background-next');
        this.characterLeft = document.getElementById('character-left');
        this.characterCenter = document.getElementById('character-center');
        this.characterRight = document.getElementById('character-right');
        this.dialogueBox = document.getElementById('dialogue-box');
        this.nameBox = document.getElementById('name-box');
        this.dialogueText = document.getElementById('dialogue-text');
        this.clickIndicator = document.getElementById('click-indicator');
        this.choicesContainer = document.getElementById('choices-container');

        // UI 버튼들
        this.btnAuto = document.getElementById('btn-auto');

        // 게임 상태
        if (typeof SCRIPT === 'undefined') {
            console.error('CRITICAL ERROR: SCRIPT data not loaded. Please check script-data.js');
            alert('데이터 파일을 불러오지 못했습니다. (script-data.js 로드 실패)');
            return;
        }
        this.currentIndex = 0;
        this.currentId = SCRIPT[0]?.id || 1;
        this.isTyping = false;
        this.typingTimeout = null;
        this.currentText = '';
        this.displayedText = '';

        // 모드 상태
        this.isAutoMode = false;
        this.autoTimeout = null;

        // 선택 기록
        this.choiceHistory = [];
        this.dynamicMapping = null;

        // BGM
        this.currentBgm = null;
        this.bgmAudio = new Audio();

        // 초기화
        this.init();
    }

    init() {
        // 이벤트 리스너 설정 (대화창과 게임 컨테이너 모두)
        this.dialogueBox.addEventListener('click', (e) => {
            e.stopPropagation(); // 이벤트 버블링 방지 (중복 클릭 방지)
            this.handleClick();
        });
        this.gameContainer.addEventListener('click', (e) => {
            // 선택지 버튼이나 UI 버튼 클릭 시 무시
            if (e.target.closest('.choice-button') || e.target.closest('#ui-buttons')) {
                return;
            }
            this.handleClick();
        });
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // UI 버튼 이벤트
        this.btnAuto.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleAuto();
        });

        // 게임 시작
        this.showScript(this.currentId);
    }

    // 스크립트 표시
    showScript(id) {
        const scriptItem = SCRIPT_MAP[id];
        if (!scriptItem) {
            console.log('스크립트 끝 또는 ID를 찾을 수 없음:', id);
            return;
        }

        this.currentId = id;
        this.currentIndex = scriptItem._index;

        // 배경 변경 (크로스페이드 효과)
        if (scriptItem.background && this.background.style.backgroundImage !== `url("${scriptItem.background}")`) {
            // 새 배경을 상위 레이어에 설정하고 페이드 인
            this.backgroundNext.style.backgroundImage = `url(${scriptItem.background})`;
            this.backgroundNext.style.opacity = '1';

            // 페이드 완료 후 하위 레이어에 복사하고 상위 숨김
            setTimeout(() => {
                this.background.style.backgroundImage = `url(${scriptItem.background})`;
                this.backgroundNext.style.opacity = '0';
            }, 500);
        }

        // BGM 변경
        if (scriptItem.bgm && scriptItem.bgm !== this.currentBgm) {
            this.currentBgm = scriptItem.bgm;
            this.bgmAudio.src = scriptItem.bgm;
            this.bgmAudio.loop = true;
            this.bgmAudio.volume = 0.5;
            this.bgmAudio.play().catch(e => console.log('BGM 자동재생 차단됨 - 클릭 후 재생됩니다'));
        }

        // 캐릭터 표시
        this.updateCharacters(scriptItem);

        // 선택지가 있는 경우
        if (scriptItem.choices && scriptItem.choices.length > 0) {
            // once 옵션이 있는 선택지 필터링 - 이미 선택한 것 제외
            const visibleChoices = scriptItem.choices.filter(choice => {
                if (choice.once) {
                    return !this.choiceHistory.some(h => h.id === this.currentId && h.choice === choice.text);
                }
                return true;
            });

            // 모든 선택지가 이미 선택되었으면 nextId로 이동
            if (visibleChoices.length === 0) {
                if (scriptItem.nextId !== undefined) {
                    this.showScript(scriptItem.nextId);
                } else {
                    this.goToNext();
                }
                return;
            }

            this.showChoices(scriptItem.choices, scriptItem.layout || 'three');
            this.dialogueBox.style.display = 'none';
            return;
        }

        // 대사 표시
        this.dialogueBox.style.display = 'block';
        this.choicesContainer.classList.remove('visible');

        // 대화창 투명도 조절 (boxOpacity: 0~1, 기본값 없으면 원래 스타일 유지)
        if (scriptItem.boxOpacity !== undefined) {
            this.dialogueBox.style.opacity = scriptItem.boxOpacity;
        } else {
            this.dialogueBox.style.opacity = 1;
        }

        // 이름 표시
        if (scriptItem.name) {
            this.nameBox.textContent = scriptItem.name;
            this.nameBox.classList.add('visible');
        } else {
            this.nameBox.classList.remove('visible');
        }

        // 텍스트 타이핑 효과
        if (scriptItem.text) {
            if (scriptItem.instant) {
                this.currentText = scriptItem.text;
                this.finishTyping();
            } else {
                this.typeText(scriptItem.text);
            }
        }
    }

    // 캐릭터 업데이트
    updateCharacters(scriptItem) {
        const chars = scriptItem.characters || {};
        const speaker = scriptItem.speaker;
        let layout = scriptItem.layout || 'three';

        // characters가 없으면 모든 캐릭터 숨김
        if (!scriptItem.characters) {
            this.hideAllCharacters();
            return;
        }

        // Hub Loop: 이미 선택한 캐릭터(once: true)는 숨김 & 동적 레이아웃 적용
        const activeChars = [];
        if (scriptItem.choices) {
            const positions = ['left', 'center', 'right'];
            positions.forEach(pos => {
                const targetChoice = scriptItem.choices.find(c => c.target === pos);
                let isVisible = true;

                if (targetChoice && targetChoice.once) {
                    const alreadyChosen = this.choiceHistory.some(h =>
                        h.id === this.currentId && h.choice === targetChoice.text
                    );
                    if (alreadyChosen) {
                        chars[pos] = null; // 이미지 숨김
                        isVisible = false;
                    }
                }

                if (isVisible && chars[pos]) {
                    activeChars.push({ pos, img: chars[pos] });
                }
            });

            // 남은 캐릭터가 2명이면 자동으로 2인 모드 적용 (강제 재배치)
            if (activeChars.length === 2) {
                layout = 'two';
                // 기존 위치 무시하고 Left/Right 슬롯에 재배치
                chars.left = activeChars[0].img;
                chars.right = activeChars[1].img;
                chars.center = null;

                this.dynamicMapping = {
                    [activeChars[0].pos]: 'left',
                    [activeChars[1].pos]: 'right'
                };
            }
            // 남은 캐릭터가 1명이면 중앙으로 재배치
            else if (activeChars.length === 1) {
                layout = 'one';
                chars.center = activeChars[0].img;
                chars.left = null;
                chars.right = null;

                this.dynamicMapping = {
                    [activeChars[0].pos]: 'center'
                };
            } else {
                this.dynamicMapping = null;
            }
        }

        // 레이아웃에 따른 위치 클래스 적용
        if (layout === 'two') {
            // 2인 모드: left와 right만 사용, 중앙으로 모음
            this.characterLeft.classList.add('two-person');
            this.characterRight.classList.add('two-person');
            this.characterCenter.classList.remove('visible');
        } else if (layout === 'one') {
            // 1인 모드: center만 사용
            this.characterLeft.classList.remove('visible');
            this.characterRight.classList.remove('visible');
            this.characterLeft.classList.remove('two-person');
            this.characterRight.classList.remove('two-person');
        } else {
            // 3인 모드: 기본 위치
            this.characterLeft.classList.remove('two-person');
            this.characterRight.classList.remove('two-person');
        }

        // 각 위치별 캐릭터 처리
        if (layout !== 'one') this.updateCharacter(this.characterLeft, chars.left, speaker === 'left');
        this.updateCharacter(this.characterCenter, chars.center, speaker === 'center');
        if (layout !== 'one') this.updateCharacter(this.characterRight, chars.right, speaker === 'right');
    }

    // 모든 캐릭터 숨김
    hideAllCharacters() {
        this.characterLeft.classList.remove('visible');
        this.characterCenter.classList.remove('visible');
        this.characterRight.classList.remove('visible');
    }

    updateCharacter(element, imagePath, isSpeaking) {
        if (imagePath) {
            element.src = imagePath;
            element.classList.add('visible');

            // 엔딩 이미지면 위치 보정 클래스 추가 (Ending.png)
            if (imagePath.includes('Ending.png')) {
                element.classList.add('ending-scene');
            } else {
                element.classList.remove('ending-scene');
            }

            if (isSpeaking) {
                element.classList.add('speaking');
                element.classList.remove('dimmed');
            } else {
                element.classList.remove('speaking');
                element.classList.add('dimmed');
            }
        } else {
            element.classList.remove('visible');
            element.classList.remove('ending-scene');
        }
    }

    // 특정 캐릭터 하이라이트 (선택지 hover용)
    highlightCharacter(position) {
        // 동적 매핑이 있으면 적용
        const actualPos = this.dynamicMapping?.[position] || position;

        this.characterLeft.classList.add('dimmed');
        this.characterLeft.classList.remove('speaking');
        this.characterCenter.classList.add('dimmed');
        this.characterCenter.classList.remove('speaking');
        this.characterRight.classList.add('dimmed');
        this.characterRight.classList.remove('speaking');

        if (actualPos === 'left') {
            this.characterLeft.classList.remove('dimmed');
            this.characterLeft.classList.add('speaking');
        } else if (actualPos === 'center') {
            this.characterCenter.classList.remove('dimmed');
            this.characterCenter.classList.add('speaking');
        } else if (actualPos === 'right') {
            this.characterRight.classList.remove('dimmed');
            this.characterRight.classList.add('speaking');
        }
    }

    resetCharacterHighlight() {
        this.dimAllCharacters();
    }

    dimAllCharacters() {
        this.characterLeft.classList.add('dimmed');
        this.characterLeft.classList.remove('speaking');
        this.characterCenter.classList.add('dimmed');
        this.characterCenter.classList.remove('speaking');
        this.characterRight.classList.add('dimmed');
        this.characterRight.classList.remove('speaking');
    }

    // 텍스트 타이핑 효과
    typeText(text) {
        this.isTyping = true;
        this.currentText = text;
        this.displayedText = '';
        this.clickIndicator.style.display = 'none';

        let index = 0;

        const type = () => {
            if (index < text.length) {
                if (text[index] === '<') {
                    const closeIndex = text.indexOf('>', index);
                    if (closeIndex !== -1) {
                        this.displayedText += text.substring(index, closeIndex + 1);
                        index = closeIndex + 1;
                    } else {
                        this.displayedText += text[index];
                        index++;
                    }
                } else {
                    this.displayedText += text[index];
                    index++;
                }

                this.dialogueText.innerHTML = this.displayedText;
                this.typingTimeout = setTimeout(type, GAME_CONFIG.textSpeed);
            } else {
                this.finishTyping();
            }
        };

        type();
    }

    finishTyping() {
        this.isTyping = false;
        this.dialogueText.innerHTML = this.currentText;
        this.clickIndicator.style.display = 'block';

        if (this.isAutoMode) {
            this.autoTimeout = setTimeout(() => {
                this.goToNext();
            }, GAME_CONFIG.autoDelay);
        }
    }

    // 선택지 표시
    showChoices(choices, layout = 'three') {
        this.choicesContainer.innerHTML = '';

        const hasPositioning = choices.some(c => c.x !== undefined || c.target);

        if (hasPositioning) {
            this.choicesContainer.style.left = '0';
            this.choicesContainer.style.top = '0';
            this.choicesContainer.style.transform = 'none';
            this.choicesContainer.style.width = '100%';
            this.choicesContainer.style.height = '100%';
            this.choicesContainer.style.flexDirection = 'initial';
        } else {
            this.choicesContainer.style.left = '50%';
            this.choicesContainer.style.top = '50%';
            this.choicesContainer.style.transform = 'translate(-50%, -50%)';
            this.choicesContainer.style.width = 'auto';
            this.choicesContainer.style.height = 'auto';
            this.choicesContainer.style.flexDirection = 'column';
        }

        const containerRect = this.gameContainer.getBoundingClientRect();

        const getCharacterCenter = (element) => {
            const rect = element.getBoundingClientRect();
            if (rect.width > 0) {
                return (rect.left - containerRect.left) + rect.width / 2;
            }
            return null;
        };

        const containerWidth = containerRect.width || 1280;
        const fallbackPos = {
            three: { left: containerWidth * 0.15, center: containerWidth * 0.5, right: containerWidth * 0.85 },
            two: { left: containerWidth * 0.3, right: containerWidth * 0.7 },
            one: { center: containerWidth * 0.5 }
        };

        const dynamicPos = {
            left: getCharacterCenter(this.characterLeft),
            center: getCharacterCenter(this.characterCenter),
            right: getCharacterCenter(this.characterRight)
        };

        // once 옵션이 있는 선택지 필터링
        const visibleChoices = choices.filter(choice => {
            if (choice.once) {
                return !this.choiceHistory.some(h => h.id === this.currentId && h.choice === choice.text);
            }
            return true;
        });

        // 모든 선택지가 이미 선택되었으면 다음으로 진행
        if (visibleChoices.length === 0) {
            const currentScript = SCRIPT_MAP[this.currentId]; // Fix: SCRIPT_MAP.get -> SCRIPT_MAP[]
            if (currentScript?.nextId !== undefined) {
                this.showScript(currentScript.nextId);
            } else {
                this.goToNext();
            }
            return;
        }

        visibleChoices.forEach((choice) => {
            const button = document.createElement('button');
            button.className = 'choice-button';

            if (choice.image) {
                button.innerHTML = `<img src="${choice.image}" class="choice-image"><span>${choice.text}</span>`;
            } else {
                button.innerHTML = choice.text;
            }

            let x = choice.x;
            let y = choice.y;

            // 동적 매핑이 있으면 적용
            let targetPos = choice.target;
            if (this.dynamicMapping && choice.target) {
                targetPos = this.dynamicMapping[choice.target] || choice.target;
            }

            if (x === undefined && targetPos) {
                x = dynamicPos[targetPos] || fallbackPos[layout]?.[targetPos] || fallbackPos.three[targetPos];

                const offsets = {
                    three: { left: 40, center: 0, right: -20 },
                    two: { left: 40, right: -45 },
                    one: { center: 0 }
                };
                const offset = offsets[layout]?.[targetPos] || 0;
                if (x) x += offset;
            }

            if (x !== undefined && y !== undefined) {
                button.style.position = 'absolute';
                button.style.left = x + 'px';
                button.style.top = y + 'px';
                button.style.transform = 'translateX(-50%)';
            }

            if (choice.target) {
                button.addEventListener('mouseenter', () => {
                    this.highlightCharacter(choice.target);
                });
                button.addEventListener('mouseleave', () => {
                    this.resetCharacterHighlight();
                });
            }

            button.addEventListener('click', () => {
                this.choiceHistory.push({ id: this.currentId, choice: choice.text });
                this.showScript(choice.nextId);
            });
            this.choicesContainer.appendChild(button);
        });

        this.choicesContainer.classList.add('visible');
        this.dimAllCharacters();
        this.disableAuto();
    }


    // 클릭 처리
    handleClick() {
        // 선택지가 표시 중이면 클릭 무시
        if (this.choicesContainer.classList.contains('visible') || this.choicesContainer.style.display === 'flex') {
            return;
        }

        // 브라우저 자동재생 정책 우회 - 클릭 시 BGM 재생 시도
        if (this.currentBgm && this.bgmAudio.paused) {
            this.bgmAudio.play().catch(e => console.log('BGM 재생 실패:', e));
        }

        if (this.isTyping) {
            // 타이핑 중이면 스킵
            clearTimeout(this.typingTimeout);
            this.dialogueText.innerHTML = this.currentText;
            this.finishTyping();
        } else {
            // 다음으로 진행
            this.goToNext();
        }
    }

    // 키보드 처리
    handleKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleClick();
        } else if (e.key === 'a' || e.key === 'A') {
            this.toggleAuto();
        } else if (e.key === 's' || e.key === 'S') {
            this.toggleSkip();
        }
    }

    // 다음 스크립트로 이동 (GoToNext Fix)
    goToNext() {
        clearTimeout(this.autoTimeout);

        const currentScript = SCRIPT_MAP[this.currentId];
        if (!currentScript) return;

        // nextId가 지정되어 있으면 최우선으로 이동
        if (currentScript.nextId !== undefined) {
            console.log(`Moving to nextId: ${currentScript.nextId}`);
            this.showScript(currentScript.nextId);
        } else {
            const nextIndex = currentScript._index + 1;
            if (nextIndex < SCRIPT.length) {
                console.log(`Moving to next index: ${SCRIPT[nextIndex].id}`);
                this.showScript(SCRIPT[nextIndex].id);
            } else {
                console.log('게임 종료');
                this.disableAutoSkip();
                // 게임 종료 처리 추가
                if (confirm('게임이 종료되었습니다. 처음으로 돌아가시겠습니까?')) {
                    location.reload();
                }
            }
        }

    }

    // 오토 모드 토글
    toggleAuto() {
        // 브라우저 자동재생 정책 우회 - 클릭 시 BGM 재생 시도
        if (this.currentBgm && this.bgmAudio.paused) {
            this.bgmAudio.play().catch(e => console.log('BGM 재생 실패:', e));
        }

        this.isAutoMode = !this.isAutoMode;
        this.btnAuto.classList.toggle('active', this.isAutoMode);

        if (this.isAutoMode) {
            this.disableSkip(); // 스킵 모드는 해제

            // 이미 타이핑이 끝났으면 바로 진행
            if (!this.isTyping) {
                this.autoTimeout = setTimeout(() => {
                    this.goToNext();
                }, GAME_CONFIG.autoDelay);
            }
        } else {
            clearTimeout(this.autoTimeout);
        }
    }

    // 오토 모드 해제
    disableAuto() {
        this.isAutoMode = false;
        this.btnAuto.classList.remove('active');
        clearTimeout(this.autoTimeout);
    }

    // 스킵 모드 토글 (S키)
    toggleSkip() {
        this.isSkipMode = !this.isSkipMode;

        if (this.isSkipMode) {
            this.disableAuto(); // 오토 모드는 해제

            // 타이핑 속도를 아주 빠르게, 대기 시간 없이
            if (this.isTyping) {
                // 타이핑 중이면 즉시 완료 처리하고 넘어가게 됨 (handleClick 로직과 유사)
                this.dialogueText.innerHTML = this.currentText;
                this.finishTyping();
            } else {
                this.goToNext();
            }
        }
    }

    disableSkip() {
        this.isSkipMode = false;
    }

    disableAutoSkip() {
        this.disableAuto();
        this.disableSkip();
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    window.game = new VisualNovelEngine();
});
