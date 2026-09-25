@props([
    'name' => 'ticker',
    'id' => 'stockSelector',
    'companies' => null,
    'selected' => null,
    'exclude' => [],
    'placeholder' => 'Nhập hoặc chọn Mã CP',
    'mode' => 'single', // 'single', 'action', 'multi'
    'autoSubmit' => false,
    'width' => 'w-full sm:w-[480px] lg:w-[520px]',
    'label' => null,
    'showExchange' => true,
])

@php
    $companiesList = $companies ?? \App\Models\MhCompany::active()->orderBy('short_name', 'asc')->get();
    $uid = 'stock_sel_' . substr(md5($id . '_' . $name . '_' . uniqid()), 0, 8);
    
    // Normalize selected value
    $selectedTicker = is_array($selected) ? ($selected[0] ?? null) : $selected;
    $selectedCompany = $selectedTicker ? $companiesList->firstWhere('short_name', $selectedTicker) : null;
    
    $displayText = '';
    if ($mode === 'single' && $selectedCompany) {
        $displayText = $selectedCompany->short_name . ' - ' . $selectedCompany->company_name;
    } elseif ($mode === 'single' && $selectedTicker) {
        $displayText = $selectedTicker;
    }
@endphp

<div class="{{ $width }} space-y-1.5" id="{{ $uid }}_wrapper">
    @if($label)
        <label class="block text-[15px] font-bold text-[#051650]">{{ $label }}</label>
    @endif

    <div class="relative" id="{{ $uid }}_container">
        <!-- Native select retained for standard form submission and script listeners -->
        <select name="{{ $name }}" id="{{ $id }}" data-stock-selector="true" class="hidden" tabindex="-1">
            <option value="" {{ empty($selectedTicker) ? 'selected' : '' }}>{{ $placeholder }}</option>
            @foreach($companiesList as $comp)
                @if(!in_array($comp->short_name, (array) $exclude))
                    <option value="{{ $comp->short_name }}" 
                            {{ $comp->short_name === $selectedTicker ? 'selected' : '' }}
                            data-name="{{ $comp->company_name }}"
                            data-exchange="{{ $comp->exchange ?? 'HOSE' }}">
                        {{ $comp->short_name }} - {{ $comp->company_name }}
                    </option>
                @endif
            @endforeach
        </select>

        <!-- Input Box with Clear & Chevron Icons -->
        <div class="relative flex items-center">
            <input type="text"
                   id="{{ $uid }}_input"
                   class="w-full h-[32px] bg-white border border-[#818181] rounded-[8px] pl-3 pr-16 text-xs text-[#323232] placeholder-[#818181] focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer focus:cursor-text shadow-sm transition-all"
                   placeholder="{{ $placeholder }}"
                   value="{{ $displayText }}"
                   title="{{ $displayText }}"
                   autocomplete="off"
                   data-selected-label="{{ $displayText }}"
                   data-selected-ticker="{{ $selectedTicker ?? '' }}">

            <!-- Clear Button -->
            <button type="button" 
                    id="{{ $uid }}_clearBtn" 
                    title="Xóa tìm kiếm"
                    class="{{ empty($displayText) ? 'hidden' : '' }} absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#D7D7D7] hover:bg-[#818181] text-white text-[10px] flex items-center justify-center transition-colors">
                &times;
            </button>

            <!-- Dropdown Toggle Button -->
            <button type="button" 
                    id="{{ $uid }}_toggleBtn"
                    tabindex="-1"
                    title="Mở danh sách"
                    class="absolute right-0 top-0 h-full px-2.5 text-[#818181] hover:text-[#051650] flex items-center justify-center transition-colors">
                <svg id="{{ $uid }}_chevron" class="w-3.5 h-3.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
        </div>

        <!-- Dropdown Menu Standard Quy Chuẩn -->
        <div id="{{ $uid }}_menu" 
             class="hidden absolute z-50 top-[36px] left-0 w-full min-w-[280px] max-h-[260px] overflow-y-auto bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg custom-scrollbar divide-y divide-gray-50">
            @foreach($companiesList as $comp)
                @php
                    $isExcluded = in_array($comp->short_name, (array) $exclude);
                    if ($isExcluded) continue;
                    $isSelected = ($comp->short_name === $selectedTicker);
                @endphp
                <div class="{{ $uid }}_item px-3.5 py-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-[#F8F3EC] transition-colors group {{ $isSelected ? 'bg-[#F8F3EC]/50 font-semibold' : '' }}"
                     data-ticker="{{ $comp->short_name }}"
                     data-name="{{ $comp->company_name }}"
                     data-exchange="{{ $comp->exchange ?? 'HOSE' }}">
                    <div class="flex items-center gap-2.5 min-w-0 pr-2">
                        <span class="w-[42px] h-[22px] rounded bg-[#051650] text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                            {{ $comp->short_name }}
                        </span>
                        <div class="min-w-0">
                            <p class="font-medium text-[#051650] truncate">{{ $comp->company_name }}</p>
                       
                        </div>
                    </div>
                    <div class="shrink-0 flex items-center gap-1.5 status-badge-container">
                        <span class="status-selected-pill px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 {{ $isSelected ? '' : 'hidden' }}">
                            <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                            </svg>
                            Đã chọn
                        </span>
                        <span class="status-unselected-hint text-[11px] text-[#051650] opacity-0 group-hover:opacity-100 font-bold transition-opacity {{ $isSelected ? 'hidden' : '' }}">
                            {{ $mode === 'action' ? '+ Thêm' : '+ Chọn' }}
                        </span>
                    </div>
                </div>
            @endforeach

            <div id="{{ $uid }}_empty" class="hidden px-4 py-3 text-center text-xs text-[#818181] italic">
                Không tìm thấy mã hoặc ngân hàng phù hợp
            </div>
        </div>
    </div>
</div>

<script>
(function() {
    function init() {
        const wrapper = document.getElementById('{{ $uid }}_wrapper');
        if (!wrapper) return;

        const input = document.getElementById('{{ $uid }}_input');
        const menu = document.getElementById('{{ $uid }}_menu');
        const toggleBtn = document.getElementById('{{ $uid }}_toggleBtn');
        const clearBtn = document.getElementById('{{ $uid }}_clearBtn');
        const chevron = document.getElementById('{{ $uid }}_chevron');
        const nativeSelect = document.getElementById('{{ $id }}');
        const emptyState = document.getElementById('{{ $uid }}_empty');
        const items = Array.from(wrapper.querySelectorAll('.{{ $uid }}_item'));
        const form = wrapper.closest('form');
        const mode = '{{ $mode }}';
        const autoSubmit = {{ $autoSubmit ? 'true' : 'false' }};

        let activeIndex = -1;

        function removeVietnameseTones(str) {
            if (!str) return '';
            return str
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/Đ/g, 'D')
                .toLowerCase()
                .trim();
        }

        function openMenu() {
            menu.classList.remove('hidden');
            if (chevron) chevron.classList.add('rotate-180');
            filterItems(input.value);
        }

        function closeMenu() {
            menu.classList.add('hidden');
            if (chevron) chevron.classList.remove('rotate-180');
            activeIndex = -1;
            updateHighlight();
        }

        function isMenuOpen() {
            return !menu.classList.contains('hidden');
        }

        function filterItems(keyword) {
            const raw = keyword || '';
            const q = removeVietnameseTones(raw);

            if (clearBtn) {
                if (raw.trim().length > 0) {
                    clearBtn.classList.remove('hidden');
                } else {
                    clearBtn.classList.add('hidden');
                }
            }

            let matchCount = 0;
            items.forEach(item => {
                const ticker = item.getAttribute('data-ticker') || '';
                const name = item.getAttribute('data-name') || '';
                const match = !q || removeVietnameseTones(ticker).includes(q) || removeVietnameseTones(name).includes(q);

                if (match) {
                    item.style.display = 'flex';
                    matchCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            if (emptyState) {
                emptyState.style.display = matchCount === 0 ? 'block' : 'none';
            }

            activeIndex = -1;
            updateHighlight();
        }

        function getVisibleItems() {
            return items.filter(it => it.style.display !== 'none');
        }

        function updateHighlight() {
            const visible = getVisibleItems();
            visible.forEach((it, idx) => {
                if (idx === activeIndex) {
                    it.classList.add('bg-[#E7F0FD]');
                    it.scrollIntoView({ block: 'nearest' });
                } else {
                    it.classList.remove('bg-[#E7F0FD]');
                }
            });
        }

        function selectItem(ticker, name, shouldSubmit = true) {
            if (!ticker) return;

            if (mode === 'action') {
                // Action mode: e.g. add ticker to compare list
                if (nativeSelect) {
                    nativeSelect.value = ticker;
                    nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
                }
                input.value = '';
                input.blur();
                closeMenu();
                return;
            }

            // Single select mode
            const label = `${ticker} - ${name}`;
            input.value = label;
            input.title = label;
            input.setAttribute('data-selected-label', label);
            input.setAttribute('data-selected-ticker', ticker);

            if (nativeSelect) {
                nativeSelect.value = ticker;
                nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Update items visual active state
            items.forEach(it => {
                const t = it.getAttribute('data-ticker');
                const selectedPill = it.querySelector('.status-selected-pill');
                const unselectedHint = it.querySelector('.status-unselected-hint');
                if (t === ticker) {
                    it.classList.add('bg-[#F8F3EC]/50', 'font-semibold');
                    if (selectedPill) selectedPill.classList.remove('hidden');
                    if (unselectedHint) unselectedHint.classList.add('hidden');
                } else {
                    it.classList.remove('bg-[#F8F3EC]/50', 'font-semibold');
                    if (selectedPill) selectedPill.classList.add('hidden');
                    if (unselectedHint) unselectedHint.classList.remove('hidden');
                }
            });

            closeMenu();

            if (shouldSubmit && autoSubmit && form) {
                form.submit();
            }
        }

        // Event listeners
        input.addEventListener('focus', () => {
            openMenu();
            input.select();
        });

        input.addEventListener('input', (e) => {
            if (!isMenuOpen()) openMenu();
            filterItems(e.target.value);
        });

        input.addEventListener('keydown', (e) => {
            const visible = getVisibleItems();
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!isMenuOpen()) {
                    openMenu();
                } else if (visible.length > 0) {
                    activeIndex = (activeIndex + 1) % visible.length;
                    updateHighlight();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!isMenuOpen()) {
                    openMenu();
                } else if (visible.length > 0) {
                    activeIndex = (activeIndex - 1 + visible.length) % visible.length;
                    updateHighlight();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (isMenuOpen() && visible.length > 0) {
                    const target = activeIndex >= 0 ? visible[activeIndex] : visible[0];
                    if (target) {
                        selectItem(target.getAttribute('data-ticker'), target.getAttribute('data-name'), true);
                    }
                } else if (autoSubmit && form) {
                    form.submit();
                }
            } else if (e.key === 'Escape') {
                const prevLabel = input.getAttribute('data-selected-label') || '';
                input.value = prevLabel;
                closeMenu();
                input.blur();
            }
        });

        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isMenuOpen()) {
                closeMenu();
            } else {
                input.focus();
            }
        });

        clearBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            input.value = '';
            filterItems('');
            input.focus();
        });

        items.forEach(it => {
            it.addEventListener('click', (e) => {
                e.stopPropagation();
                const ticker = it.getAttribute('data-ticker');
                const name = it.getAttribute('data-name');
                selectItem(ticker, name, true);
            });
        });

        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                if (isMenuOpen()) {
                    if (mode !== 'action') {
                        const prevLabel = input.getAttribute('data-selected-label') || '';
                        input.value = prevLabel;
                    } else {
                        input.value = '';
                    }
                    closeMenu();
                }
            }
        });

        // Listen for external value changes on nativeSelect (e.g. from flow-engine or other scripts)
        if (nativeSelect) {
            nativeSelect.addEventListener('change', () => {
                const val = nativeSelect.value;
                if (!val && mode === 'action') {
                    input.value = '';
                    return;
                }
                const matchedItem = items.find(it => it.getAttribute('data-ticker') === val);
                if (matchedItem && mode !== 'action') {
                    const name = matchedItem.getAttribute('data-name');
                    const label = `${val} - ${name}`;
                    input.value = label;
                    input.title = label;
                    input.setAttribute('data-selected-label', label);
                    input.setAttribute('data-selected-ticker', val);
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
</script>
