// ============================================================================
// DND.HTML - CHARACTER SHEET SCRIPT
// ============================================================================

let remainingPoints = 10;

// Default attributes (will be overwritten by class)
let attributes = {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10
};

// Class-specific starting stats (D&D 5e standard array distributed)
const classStartingStats = {
    'Warrior': {
        str: 15,  // Primary - melee combat
        dex: 13,  // Secondary - AC
        con: 14,  // Secondary - HP
        int: 8,   // Dump stat
        wis: 12,  // Decent - Perception
        cha: 10   // Average
    },
    'Rogue': {
        str: 10,  // Average
        dex: 15,  // Primary - attacks, AC, stealth
        con: 12,  // Decent - HP
        int: 13,  // Good - Investigation
        wis: 14,  // Secondary - Perception
        cha: 8    // Dump stat
    },
    'Mage': {
        str: 8,   // Dump stat
        dex: 14,  // Secondary - AC
        con: 13,  // Decent - HP/Concentration
        int: 15,  // Primary - spellcasting
        wis: 12,  // Decent - Saves
        cha: 10   // Average
    },
    'Cleric': {
        str: 13,  // Decent - melee option
        dex: 10,  // Average
        con: 14,  // Secondary - HP
        int: 8,   // Dump stat
        wis: 15,  // Primary - spellcasting
        cha: 12   // Decent - social
    }
};

// Race-specific stat bonuses (D&D 5e racial bonuses)
const raceStatBonuses = {
    'Human': {
        str: 1,
        dex: 1,
        con: 1,
        int: 1,
        wis: 1,
        cha: 1
    },
    'Elf': {
        str: 0,
        dex: 2,  // Nimble and graceful
        con: 0,
        int: 1,  // Keen mind
        wis: 0,
        cha: 0
    },
    'Dwarf': {
        str: 0,
        dex: 0,
        con: 2,  // Hardy and resilient
        int: 0,
        wis: 1,  // Wise and traditional
        cha: 0
    },
    'Halfling': {
        str: 0,
        dex: 2,  // Small and quick
        con: 0,
        int: 0,
        wis: 0,
        cha: 1   // Friendly and likeable
    }
};

// Apply race bonuses to base stats
function applyRaceBonuses(baseStats, race) {
    const bonuses = raceStatBonuses[race];
    if (!bonuses) return baseStats;
    
    const finalStats = {};
    for (let attr in baseStats) {
        finalStats[attr] = baseStats[attr] + (bonuses[attr] || 0);
    }
    return finalStats;
}

// HP and MP system
let currentHP = 100;
let maxHP = 100;
let currentMP = 50;
let maxMP = 50;

// Starting equipment by class (D&D 5e based)
// Each class starts with 3 items out of 50 inventory slots (3/50)
// Image files should be 128x128 pixels (or 256x256 for retina displays)
// Supported formats: PNG, JPG, WEBP, GIF
const classStartingItems = {
    'Warrior': [
        { name: 'Longsword', image: 'longsword.png', description: 'Martial weapon (1d8 slashing)' },
        { name: 'Shield', image: 'shield.png', description: 'Heavy shield (+2 AC)' },
        { name: 'Health Potion', image: 'health_potion.png', description: 'Restores 2d4+2 HP' }
    ],
    'Rogue': [
        { name: 'Dagger', image: 'dagger.png', description: 'Light weapon (1d4 piercing)' },
        { name: 'Thieves Tools', image: 'thieves_tools.png', description: 'For lockpicking and traps' },
        { name: 'Leather Armor', image: 'leather_armor.png', description: 'Light armor (AC 11 + DEX)' }
    ],
    'Mage': [
        { name: 'Spellbook', image: 'spellbook.png', description: 'Contains 6 level 1 spells' },
        { name: 'Arcane Focus', image: 'arcane_focus.png', description: 'Crystal orb for spellcasting' },
        { name: 'Mana Potion', image: 'mana_potion.png', description: 'Restores 2d4+2 MP' }
    ],
    'Cleric': [
        { name: 'Mace', image: 'mace.png', description: 'Simple weapon (1d6 bludgeoning)' },
        { name: 'Holy Symbol', image: 'holy_symbol.png', description: 'Divine spellcasting focus' },
        { name: 'Healing Scroll', image: 'healing_scroll.png', description: 'Cure Wounds spell scroll' }
    ]
};

// Default to Warrior items if class not found
let inventoryItems = classStartingItems['Warrior'];

// D&D Traits/Feats based on ability scores
const traitsByAttribute = {
    str: [
        { name: 'Powerful Build', minStat: 14, description: 'You count as one size larger for carrying capacity and push/pull/lift' },
        { name: 'Heavy Weapon Master', minStat: 16, description: '+3 damage with heavy melee weapons' },
        { name: 'Grappler', minStat: 18, description: 'Advantage on grapple checks and improved pin' },
        { name: 'Savage Attacker', minStat: 20, description: 'Reroll melee weapon damage once per turn' }
    ],
    dex: [
        { name: 'Acrobat', minStat: 14, description: 'You have advantage on Acrobatics checks' },
        { name: 'Mobile', minStat: 16, description: '+10 movement speed and avoid opportunity attacks' },
        { name: 'Sharpshooter', minStat: 18, description: 'Ignore cover and +5 damage with ranged weapons' },
        { name: 'Alert', minStat: 20, description: '+5 initiative and cannot be surprised' }
    ],
    con: [
        { name: 'Resilient', minStat: 14, description: 'Advantage on death saving throws' },
        { name: 'Durable', minStat: 16, description: 'Regain +2 HP when healing' },
        { name: 'Tough', minStat: 18, description: 'Gain +2 HP per level' },
        { name: 'Relentless', minStat: 20, description: 'Once per day, drop to 1 HP instead of 0' }
    ],
    int: [
        { name: 'Keen Mind', minStat: 14, description: '+1 INT and excellent memory' },
        { name: 'Ritual Caster', minStat: 16, description: 'Cast 2 ritual spells' },
        { name: 'War Caster', minStat: 18, description: 'Advantage on concentration saves' },
        { name: 'Arcane Scholar', minStat: 20, description: 'Learn one additional spell of any level' }
    ],
    wis: [
        { name: 'Observant', minStat: 14, description: '+5 passive Perception and Investigation' },
        { name: 'Healer', minStat: 16, description: 'Heal +4 HP when using healing spells' },
        { name: 'Perceptive', minStat: 18, description: 'Cannot be surprised and see invisible creatures' },
        { name: 'Mystic Insight', minStat: 20, description: 'Detect magic at will' }
    ],
    cha: [
        { name: 'Inspiring Leader', minStat: 14, description: 'Grant temp HP to allies with inspiring speech' },
        { name: 'Actor', minStat: 16, description: 'Advantage on Deception and Performance' },
        { name: 'Silver Tongue', minStat: 18, description: 'Reroll failed Persuasion checks' },
        { name: 'Lucky', minStat: 20, description: 'Three luck points to reroll any d20' }
    ]
};

// Selected traits storage
let selectedTraits = [];

function calculateMaxHP() {
    // Base HP 100 + (CON * 2)
    return 100 + (attributes.con * 2);
}

function calculateMaxMP() {
    // Base MP 50 + (INT + WIS)
    return 50 + attributes.int + attributes.wis;
}

function updateHPBar() {
    maxHP = calculateMaxHP();
    if (currentHP > maxHP) currentHP = maxHP;
    
    const hpBar = document.getElementById('hpBar');
    const hpText = document.getElementById('hpText');
    
    if (hpBar) {
        const percentage = (currentHP / maxHP) * 100;
        hpBar.style.width = percentage + '%';
    }
    
    if (hpText) {
        hpText.textContent = `${currentHP} / ${maxHP}`;
    }
}

function updateMPBar() {
    maxMP = calculateMaxMP();
    if (currentMP > maxMP) currentMP = maxMP;
    
    const mpBar = document.getElementById('mpBar');
    const mpText = document.getElementById('mpText');
    
    if (mpBar) {
        const percentage = (currentMP / maxMP) * 100;
        mpBar.style.width = percentage + '%';
    }
    
    if (mpText) {
        mpText.textContent = `${currentMP} / ${maxMP}`;
    }
}

function regenerateHP() {
    if (currentHP < maxHP) {
        currentHP = Math.min(currentHP + 1, maxHP);
        updateHPBar();
    }
}

function regenerateMP() {
    if (currentMP < maxMP) {
        currentMP = Math.min(currentMP + 1, maxMP);
        updateMPBar();
    }
}

function increaseAttribute(attr) {
   
    if (remainingPoints <= 0) {
        alert('No points remaining!');
        return;
    }

    attributes[attr]++;
    remainingPoints--;

    updateDisplay(attr);
    
    // Update HP/MP when relevant stats change
    if (attr === 'con') {
        updateHPBar();
    }
    if (attr === 'int' || attr === 'wis') {
        updateMPBar();
    }
    
    // Check for new trait unlocks
    checkTraitUnlocks(attr);
}

function checkTraitUnlocks(attr) {
    const attrValue = attributes[attr];
    const availableTraits = traitsByAttribute[attr];
    
    if (!availableTraits) return;
    
    // Find newly unlocked traits
    const newlyUnlocked = availableTraits.filter(trait => {
        const wasLocked = (attrValue - 1) < trait.minStat;
        const isNowUnlocked = attrValue >= trait.minStat;
        const notAlreadySelected = !selectedTraits.find(t => t.name === trait.name);
        return wasLocked && isNowUnlocked && notAlreadySelected;
    });
    
    if (newlyUnlocked.length > 0) {
        showTraitSelection(attr, newlyUnlocked);
    }
}

function showTraitSelection(attr, traits) {
    const modal = document.getElementById('traitModal');
    const traitList = document.getElementById('traitList');
    const attrName = attr.toUpperCase();
    
    document.getElementById('traitModalTitle').textContent = `New ${attrName} Trait Available!`;
    
    traitList.innerHTML = '';
    
    traits.forEach(trait => {
        const traitCard = document.createElement('div');
        traitCard.className = 'trait-card';
        traitCard.innerHTML = `
            <h4>${trait.name}</h4>
            <p class="trait-requirement">Requires ${attrName} ${trait.minStat}+</p>
            <p class="trait-description">${trait.description}</p>
            <button class="trait-select-btn" onclick="selectTrait('${attr}', '${trait.name}')">Select Trait</button>
        `;
        traitList.appendChild(traitCard);
    });
    
    modal.style.display = 'flex';
}

function selectTrait(attr, traitName) {
    const trait = traitsByAttribute[attr].find(t => t.name === traitName);
    if (trait && !selectedTraits.find(t => t.name === traitName)) {
        selectedTraits.push({ ...trait, attribute: attr.toUpperCase() });
        updateTraitsDisplay();
        closeTraitModal();
    }
}

function closeTraitModal() {
    document.getElementById('traitModal').style.display = 'none';
}

function updateTraitsDisplay() {
    const traitsContainer = document.getElementById('traitsContainer');
    if (!traitsContainer) return;
    
    if (selectedTraits.length === 0) {
        traitsContainer.innerHTML = '<p style="color: #a0826d; text-align: center;">No traits selected yet</p>';
        return;
    }
    
    traitsContainer.innerHTML = '';
    selectedTraits.forEach(trait => {
        const traitElement = document.createElement('div');
        traitElement.className = 'trait-item';
        traitElement.innerHTML = `
            <div class="trait-header">
                <strong>${trait.name}</strong>
                <span class="trait-badge">${trait.attribute}</span>
            </div>
            <p class="trait-desc">${trait.description}</p>
        `;
        traitsContainer.appendChild(traitElement);
    });
}

function updateDisplay(attr) {
    const valueElement = document.getElementById(`${attr}-value`);
    if (valueElement) {
        valueElement.textContent = attributes[attr];
    }

    const pointsElement = document.getElementById('points-remaining');
    if (pointsElement) {
        pointsElement.textContent = remainingPoints;
    }

    if (remainingPoints <= 0) {
        const buttons = document.querySelectorAll('.plus-btn');
        buttons.forEach(btn => {
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
    }
}

function createInventorySlots() {
    const inventoryGrid = document.getElementById('inventoryGrid');
    if (!inventoryGrid) return;
    
    // Create 50 inventory slots
    for (let i = 0; i < 50; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        
        if (i < inventoryItems.length) {
            // Filled slot with item
            const item = inventoryItems[i];
            slot.classList.add('filled');
            slot.innerHTML = `
                <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'; this.parentElement.innerHTML+='❌';">
                <div class="tooltip">${item.description}</div>
            `;
            
            // Add hold-click functionality
            setupItemHoldClick(slot, item);
        }
        
        inventoryGrid.appendChild(slot);
    }
}

// Hold-click functionality for items
let holdTimer = null;
let isHolding = false;

function setupItemHoldClick(slotElement, item) {
    // Mouse events (desktop)
    slotElement.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isHolding = true;
        holdTimer = setTimeout(() => {
            if (isHolding) {
                showItemModal(item);
            }
        }, 500); // Hold for 500ms
    });
    
    slotElement.addEventListener('mouseup', cancelHold);
    slotElement.addEventListener('mouseleave', cancelHold);
    
    // Touch events (mobile)
    slotElement.addEventListener('touchstart', function(e) {
        e.preventDefault();
        isHolding = true;
        holdTimer = setTimeout(() => {
            if (isHolding) {
                showItemModal(item);
            }
        }, 500); // Hold for 500ms
    });
    
    slotElement.addEventListener('touchend', cancelHold);
    slotElement.addEventListener('touchcancel', cancelHold);
}

function cancelHold() {
    isHolding = false;
    if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
    }
}

function showItemModal(item) {
    const modal = document.getElementById('itemModal');
    const modalImage = document.querySelector('#itemModalImage img');
    const modalName = document.getElementById('itemModalName');
    const modalDescription = document.getElementById('itemModalDescription');
    
    if (modal && modalImage && modalName && modalDescription) {
        modalImage.src = item.image;
        modalImage.alt = item.name;
        modalName.textContent = item.name;
        modalDescription.textContent = item.description;
        
        modal.style.display = 'flex';
    }
}

function closeItemModal(event) {
    const modal = document.getElementById('itemModal');
    if (modal) {
        // Close if clicking outside the modal content or on close button
        if (!event || event.target === modal) {
            modal.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Character sheet loaded!');
    console.log('Starting points:', remainingPoints);
    
    // Load character data from localStorage
    const characterData = localStorage.getItem('characterData');
    
    if (characterData) {
        const character = JSON.parse(characterData);
        
        // Update character name
        const nameElement = document.getElementById('characterName');
        if (nameElement) {
            nameElement.textContent = character.name;
        }
        
        // Update character info
        const infoElement = document.getElementById('characterInfo');
        if (infoElement) {
            const genderIcon = character.gender === 'Male' ? '♂️' : character.gender === 'Female' ? '♀️' : '';
            infoElement.textContent = `${genderIcon} ${character.gender} | Race: ${character.race} | Class: ${character.class}`;
        }
        
        // Update level badge
        const levelElement = document.getElementById('characterLevel');
        if (levelElement) {
            levelElement.textContent = character.level;
        }
        
        // Load class-specific starting stats
        if (character.class && classStartingStats[character.class]) {
            let baseStats = { ...classStartingStats[character.class] };
            
            // Apply race bonuses
            if (character.race && raceStatBonuses[character.race]) {
                attributes = applyRaceBonuses(baseStats, character.race);
                console.log(`Loaded ${character.class} stats with ${character.race} racial bonuses:`, attributes);
            } else {
                attributes = baseStats;
                console.log(`Loaded ${character.class} starting stats:`, attributes);
            }
            
            // Update all attribute displays
            Object.keys(attributes).forEach(attr => {
                const valueElement = document.getElementById(`${attr}-value`);
                if (valueElement) {
                    valueElement.textContent = attributes[attr];
                }
            });
        } else {
            // Default to Warrior if class not recognized
            let baseStats = { ...classStartingStats['Warrior'] };
            attributes = character.race ? applyRaceBonuses(baseStats, character.race) : baseStats;
            console.log('Using default Warrior stats');
        }
        
        // Load class-specific starting items
        if (character.class && classStartingItems[character.class]) {
            inventoryItems = classStartingItems[character.class];
            console.log(`Loaded ${character.class} starting equipment:`, inventoryItems);
        } else {
            // Default to Warrior if class not recognized
            inventoryItems = classStartingItems['Warrior'];
            console.log('Using default Warrior equipment');
        }
        
        console.log('Loaded character:', character);
    }
    
    // Initialize inventory slots
    createInventorySlots();
    
    // Initialize HP and MP
    updateHPBar();
    updateMPBar();
    
    // Initialize traits display
    updateTraitsDisplay();
    
    // Start regeneration timers
    // HP regenerates every 5 seconds
    setInterval(regenerateHP, 5000);
    
    // MP regenerates every 2 seconds
    setInterval(regenerateMP, 2000);
    
    console.log('HP Regen: Every 5 seconds');
    console.log('MP Regen: Every 2 seconds');
    console.log('Trait system loaded');
});

// ============================================================================
// DNDCHARACTER.HTML - CHARACTER CREATION SCRIPT
// ============================================================================

// Character creation variables
let selectedGender = '';
let selectedRace = '';
let selectedClass = '';

// Update overview card
function updateOverview() {
    const characterName = document.getElementById('characterName');
    const overviewCard = document.getElementById('overviewCard');
    const createBtn = document.getElementById('createBtn');
    
    // Check if elements exist (only on character creation page)
    if (!characterName || !overviewCard || !createBtn) return;
    
    const characterNameValue = characterName.value.trim();

    // Update overview values
    document.getElementById('overviewName').textContent = characterNameValue || '-';
    
    const genderIcon = selectedGender === 'Male' ? '♂️' : selectedGender === 'Female' ? '♀️' : '';
    document.getElementById('overviewGender').textContent = selectedGender ? `${genderIcon} ${selectedGender}` : '-';
    
    document.getElementById('overviewRace').textContent = selectedRace || '-';
    document.getElementById('overviewClass').textContent = selectedClass || '-';

    // Show overview card and enable button only if all fields are filled
    if (characterNameValue && selectedGender && selectedRace && selectedClass) {
        overviewCard.style.display = 'block';
        createBtn.style.opacity = '1';
        createBtn.style.pointerEvents = 'auto';
    } else {
        overviewCard.style.display = 'none';
        createBtn.style.opacity = '0.5';
        createBtn.style.pointerEvents = 'none';
    }
}

// Initialize character creation page
function initCharacterCreation() {
    // Check if we're on the character creation page
    const characterForm = document.getElementById('characterForm');
    if (!characterForm) return; // Not on character creation page

    console.log('Character creation page loaded!');
    
    // ONLOAD - Page load animation
    const container = document.querySelector('.container');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            container.style.transition = 'all 0.5s ease';
            container.style.opacity = '1';
            container.style.transform = 'scale(1)';
        }, 100);
    }

    // Load draft data if exists
    const draft = localStorage.getItem('characterDraft');
    if (draft) {
        const data = JSON.parse(draft);
        const nameInput = document.getElementById('characterName');
        if (nameInput) {
            nameInput.value = data.name || '';
        }
    }

    // ONUNLOAD - Save draft when leaving page
    window.onunload = function() {
        const nameInput = document.getElementById('characterName');
        if (!nameInput) return;
        
        const characterName = nameInput.value.trim();
        if (characterName && !localStorage.getItem('characterData')) {
            const draft = {
                name: characterName,
                gender: selectedGender,
                race: selectedRace,
                class: selectedClass
            };
            localStorage.setItem('characterDraft', JSON.stringify(draft));
        }
    };

    // Setup name input events
    const nameInput = document.getElementById('characterName');
    if (nameInput) {
        // ONFOCUS - Highlight input when focused
        nameInput.onfocus = function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 0 20px rgba(139, 90, 43, 0.6), inset 0 2px 6px rgba(0, 0, 0, 0.6)';
        };

        // ONBLUR - Validate and reset input styling when focus lost
        nameInput.onblur = function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
            
            // Validation on blur
            if (this.value.trim()) {
                this.style.borderColor = '#8b5a2b';
            } else {
                this.style.borderColor = '#5c3a1e';
            }
        };

        // ONCHANGE - Real-time validation of name input
        nameInput.onchange = function() {
            console.log('Name changed to:', this.value);
            const errorMessage = document.getElementById('errorMessage');
            if (this.value.trim()) {
                errorMessage.classList.remove('show');
            }
            updateOverview();
        };

        // Also update on keyup for real-time feedback
        nameInput.addEventListener('keyup', updateOverview);
    }

    // Handle gender selection
    document.querySelectorAll('[data-gender]').forEach(card => {
        // ONCLICK - Select gender
        card.onclick = function() {
            document.querySelectorAll('[data-gender]').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedGender = this.getAttribute('data-gender');
            console.log('Gender selected:', selectedGender);
            document.getElementById('errorMessage').classList.remove('show');
            updateOverview();
        };

        // ONMOUSEOVER - Hover effect
        card.onmouseover = function() {
            if (!this.classList.contains('selected')) {
                this.style.background = 'linear-gradient(135deg, #1a1410 0%, #2b1f17 100%)';
            }
        };

        // ONMOUSEOUT - Remove hover effect
        card.onmouseout = function() {
            if (!this.classList.contains('selected')) {
                this.style.background = 'linear-gradient(135deg, #0d0906 0%, #1a1410 100%)';
            }
        };

        // ONMOUSEDOWN - Press effect
        card.onmousedown = function() {
            this.style.transform = 'scale(0.95)';
        };

        // ONMOUSEUP - Release effect
        card.onmouseup = function() {
            this.style.transform = 'scale(1)';
        };
    });

    // Handle race selection with events
    document.querySelectorAll('[data-race]').forEach(card => {
        // ONCLICK - Select race
        card.onclick = function() {
            document.querySelectorAll('[data-race]').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedRace = this.getAttribute('data-race');
            console.log('Race selected:', selectedRace);
            document.getElementById('errorMessage').classList.remove('show');
            updateOverview();
        };

        // ONMOUSEOVER - Hover effect
        card.onmouseover = function() {
            if (!this.classList.contains('selected')) {
                this.style.background = 'linear-gradient(135deg, #1a1410 0%, #2b1f17 100%)';
            }
        };

        // ONMOUSEOUT - Remove hover effect
        card.onmouseout = function() {
            if (!this.classList.contains('selected')) {
                this.style.background = 'linear-gradient(135deg, #0d0906 0%, #1a1410 100%)';
            }
        };

        // ONMOUSEDOWN - Press effect
        card.onmousedown = function() {
            this.style.transform = 'scale(0.95)';
        };

        // ONMOUSEUP - Release effect
        card.onmouseup = function() {
            this.style.transform = 'scale(1)';
        };
    });

    // Handle Tekken-style class selection
    document.querySelectorAll('.tekken-class-card').forEach(card => {
        // ONCLICK - Select class
        card.onclick = function() {
            document.querySelectorAll('.tekken-class-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedClass = this.getAttribute('data-class');
            console.log('Class selected:', selectedClass);
            document.getElementById('errorMessage').classList.remove('show');
            updateOverview();
        };
    });

    // Create button events
    const createBtn = document.querySelector('.create-btn');
    if (createBtn) {
        // ONMOUSEOVER - Button hover
        createBtn.onmouseover = function() {
            this.style.letterSpacing = '2px';
        };

        // ONMOUSEOUT - Button hover out
        createBtn.onmouseout = function() {
            this.style.letterSpacing = 'normal';
        };

        // ONMOUSEDOWN - Button press
        createBtn.onmousedown = function() {
            this.style.transform = 'scale(0.95)';
        };

        // ONMOUSEUP - Button release
        createBtn.onmouseup = function() {
            this.style.transform = 'scale(1)';
        };
    }

    // Handle form submission
    characterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('characterName');
        const characterName = nameInput ? nameInput.value.trim() : '';
        const errorMessage = document.getElementById('errorMessage');

        // Validation
        if (!characterName || !selectedGender || !selectedRace || !selectedClass) {
            errorMessage.classList.add('show');
            errorMessage.textContent = 'Please fill in all fields!';
            
            // Shake animation for error
            const container = document.getElementById('mainContainer');
            if (container) {
                container.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    container.style.animation = '';
                }, 500);
            }
            return;
        }

        errorMessage.classList.remove('show');

        // Store character data
        const characterData = {
            name: characterName,
            gender: selectedGender,
            race: selectedRace,
            class: selectedClass,
            level: 1
        };

        localStorage.setItem('characterData', JSON.stringify(characterData));
        localStorage.removeItem('characterDraft'); // Clear draft

        // Show loading overlay
        const mainContainer = document.getElementById('mainContainer');
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (mainContainer) mainContainer.classList.add('blur');
        if (loadingOverlay) loadingOverlay.classList.add('active');

        // Redirect after loading animation (2.5 seconds)
        setTimeout(() => {
            window.location.href = 'DND.html';
        }, 2500);
    });
}

// Initialize the appropriate page on load
window.addEventListener('DOMContentLoaded', initCharacterCreation);
