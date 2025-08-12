/**
 * Chicken Viability Calculator JavaScript
 * Handles interactivity and real-time calculations
 */

(function($) {
    'use strict';

    // Calculator object
    var ChickenCalculator = {
        // Current selections
        selectedFeed: 'standard',
        selectedProduction: 'realistic',
        selectedStartingCost: 'basic',
        
        // HTML escaping function to prevent XSS
        escapeHtml: function(text) {
            var map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
        },
        
        // Initialize the calculator
        init: function() {
            this.bindEvents();
            this.setDefaultSelections();
            this.calculateAndUpdate();
        },
        
        // Bind event handlers
        bindEvents: function() {
            var self = this;
            
            // Option card clicks
            $(document).on('click', '.cvc-option-card', function() {
                self.handleOptionSelection($(this));
            });
            
            // Input field changes
            $('#bird-count, #egg-price, #starting-cost-custom').on('input', function() {
                self.calculateAndUpdate();
            });
            
            // Custom starting cost input
            $('#starting-cost-custom').on('input', function() {
                self.handleCustomStartingCost($(this).val());
            });
        },
        
        // Set default selections
        setDefaultSelections: function() {
            // Select default feed option (standard - index 1)
            $('[data-option-type="feed"][data-option-id="standard"]').addClass('cvc-selected');
            
            // Select default production option (realistic - index 1) 
            $('[data-option-type="production"][data-option-id="realistic"]').addClass('cvc-selected');
            
            // Select default starting cost option (basic - index 1)
            $('[data-option-type="starting-cost"][data-option-id="basic"]').addClass('cvc-selected');
        },
        
        // Handle option card selection
        handleOptionSelection: function($card) {
            var optionType = $card.data('option-type');
            var optionId = $card.data('option-id');
            
            // Remove selection from siblings
            $card.siblings('[data-option-type="' + optionType + '"]').removeClass('cvc-selected');
            
            // Add selection to clicked card
            $card.addClass('cvc-selected');
            
            // Update internal state and hidden inputs
            if (optionType === 'feed') {
                this.selectedFeed = optionId;
                $('#selected-feed').val(optionId);
            } else if (optionType === 'production') {
                this.selectedProduction = optionId;
                $('#selected-production').val(optionId);
            } else if (optionType === 'starting-cost') {
                this.selectedStartingCost = optionId;
                var cost = $card.data('cost');
                if (cost) {
                    $('#starting-cost-custom').val(cost);
                }
            }
            
            // Recalculate
            this.calculateAndUpdate();
        },
        
        // Handle custom starting cost input
        handleCustomStartingCost: function(value) {
            var cost = parseFloat(value) || 0;
            
            // Check if this matches any preset option
            var matchingOption = null;
            $('[data-option-type="starting-cost"]').each(function() {
                if ($(this).data('cost') == cost) {
                    matchingOption = $(this);
                    return false;
                }
            });
            
            if (matchingOption) {
                // Select the matching preset option
                $('[data-option-type="starting-cost"]').removeClass('cvc-selected');
                matchingOption.addClass('cvc-selected');
                this.selectedStartingCost = matchingOption.data('option-id');
            } else {
                // Clear all preset selections for custom amount
                $('[data-option-type="starting-cost"]').removeClass('cvc-selected');
                this.selectedStartingCost = 'custom';
            }
        },
        
        // Validate input values
        validateInputs: function(values) {
            var errors = [];
            
            if (values.birdCount < 1 || values.birdCount > 1000) {
                errors.push('Bird count must be between 1 and 1000');
            }
            
            if (values.eggPrice < 0 || values.eggPrice > 50) {
                errors.push('Egg price must be between $0 and $50');
            }
            
            if (values.startingCost < 0 || values.startingCost > 100000) {
                errors.push('Starting cost must be between $0 and $100,000');
            }
            
            return errors;
        },
        
        // Get current form values
        getFormValues: function() {
            var birdCount = parseInt($('#bird-count').val()) || 0;
            var eggPrice = parseFloat($('#egg-price').val()) || 0;
            var startingCost = parseFloat($('#starting-cost-custom').val()) || 0;
            
            // Get selected feed cost
            var feedCost = 0;
            var $selectedFeed = $('[data-option-type="feed"].cvc-selected');
            if ($selectedFeed.length) {
                feedCost = parseFloat($selectedFeed.data('cost')) || 0;
            }
            
            // Get selected production rate
            var eggsPerMonth = 0;
            var $selectedProduction = $('[data-option-type="production"].cvc-selected');
            if ($selectedProduction.length) {
                eggsPerMonth = parseFloat($selectedProduction.data('eggs-per-month')) || 0;
            }
            
            return {
                birdCount: birdCount,
                eggPrice: eggPrice,
                startingCost: startingCost,
                feedCost: feedCost,
                eggsPerMonth: eggsPerMonth
            };
        },
        
        // Calculate viability (client-side for immediate feedback)
        calculateViability: function(values) {
            var monthlyFeedCost = values.birdCount * values.feedCost;
            var monthlyEggProduction = values.birdCount * values.eggsPerMonth;
            var monthlyEggValue = monthlyEggProduction * values.eggPrice;
            var monthlyProfit = monthlyEggValue - monthlyFeedCost;
            var annualFeedCost = monthlyFeedCost * 12;
            var annualEggValue = monthlyEggValue * 12;
            var annualProfit = annualEggValue - annualFeedCost;
            var paybackPeriod = monthlyProfit > 0 ? values.startingCost / monthlyProfit : null;
            
            return {
                monthlyFeedCost: monthlyFeedCost,
                monthlyEggProduction: monthlyEggProduction,
                monthlyEggValue: monthlyEggValue,
                monthlyProfit: monthlyProfit,
                annualFeedCost: annualFeedCost,
                annualEggValue: annualEggValue,
                annualProfit: annualProfit,
                paybackPeriod: paybackPeriod
            };
        },
        
        // Calculate and update results
        calculateAndUpdate: function() {
            var values = this.getFormValues();
            
            // Validate inputs
            var errors = this.validateInputs(values);
            if (errors.length > 0) {
                this.showErrorMessage(errors.join('<br>'));
                $('#cvc-results').hide();
                return;
            }
            
            // Skip if essential values are missing
            if (values.birdCount <= 0 || values.feedCost <= 0 || values.eggsPerMonth <= 0) {
                $('#cvc-results').hide();
                this.hideErrorMessage();
                return;
            }
            
            // Hide any previous error messages
            this.hideErrorMessage();
            
            var results = this.calculateViability(values);
            this.updateResultsDisplay(results, values);
            this.updateAssessment(results, values);
            
            // Show results section
            $('#cvc-results').show().addClass('cvc-fade-in');
        },
        
        // Show error message
        showErrorMessage: function(message) {
            var errorHtml = '<div id="cvc-error-message" class="cvc-error-box" style="background: #fee; border: 1px solid #f87171; color: #dc2626; padding: 1rem; border-radius: 8px; margin: 1rem 0;">' + 
                            '<strong>⚠️ Validation Error:</strong><br>' + message + '</div>';
            
            $('#cvc-error-message').remove();
            $('.cvc-container').prepend(errorHtml);
        },
        
        // Hide error message
        hideErrorMessage: function() {
            $('#cvc-error-message').remove();
        },
        
        // Update results display
        updateResultsDisplay: function(results, values) {
            var html = `
                <div class="cvc-stats-grid">
                    <div class="cvc-stat-card">
                        <div class="cvc-stat-title">Monthly Feed Cost</div>
                        <div class="cvc-stat-value">$${results.monthlyFeedCost.toFixed(2)}</div>
                        <div class="cvc-stat-label">total feed expense</div>
                    </div>
                    <div class="cvc-stat-card">
                        <div class="cvc-stat-title">Monthly Egg Production</div>
                        <div class="cvc-stat-value">${Math.round(results.monthlyEggProduction)}</div>
                        <div class="cvc-stat-label">eggs per month</div>
                    </div>
                    <div class="cvc-stat-card">
                        <div class="cvc-stat-title">Monthly Egg Value</div>
                        <div class="cvc-stat-value">$${results.monthlyEggValue.toFixed(2)}</div>
                        <div class="cvc-stat-label">potential revenue</div>
                    </div>
                    <div class="cvc-stat-card">
                        <div class="cvc-stat-title">Monthly Profit</div>
                        <div class="cvc-stat-value ${results.monthlyProfit > 0 ? 'cvc-profit-positive' : 'cvc-profit-negative'}">
                            $${results.monthlyProfit.toFixed(2)}
                        </div>
                        <div class="cvc-stat-label">
                            <span class="${results.monthlyProfit > 0 ? 'cvc-profit-positive' : 'cvc-profit-negative'}">
                                ${results.monthlyProfit > 0 ? 'Profitable' : 'Loss'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="cvc-grid-2">
                    <div class="cvc-glass-card">
                        <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin-bottom: 1rem;">📈 Annual Summary</h3>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                            <span style="color: #6b7280;">Annual Feed Cost:</span>
                            <span style="font-weight: 600;">$${results.annualFeedCost.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                            <span style="color: #6b7280;">Annual Egg Value:</span>
                            <span style="font-weight: 600;">$${results.annualEggValue.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid #e5e7eb;">
                            <span style="color: #111827; font-weight: 600;">Annual Profit:</span>
                            <span style="font-weight: bold;" class="${results.annualProfit > 0 ? 'cvc-profit-positive' : 'cvc-profit-negative'}">
                                $${results.annualProfit.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="cvc-glass-card">
                        <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin-bottom: 1rem;">⏱️ Payback Analysis</h3>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                            <span style="color: #6b7280;">Starting Investment:</span>
                            <span style="font-weight: 600;">$${values.startingCost}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                            <span style="color: #6b7280;">Monthly Profit:</span>
                            <span style="font-weight: 600;" class="${results.monthlyProfit > 0 ? 'cvc-profit-positive' : 'cvc-profit-negative'}">
                                $${results.monthlyProfit.toFixed(2)}
                            </span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid #e5e7eb;">
                            <span style="color: #111827; font-weight: 600;">Payback Period:</span>
                            <span style="font-weight: bold;" class="${results.paybackPeriod && results.paybackPeriod > 0 ? (results.paybackPeriod <= 12 ? 'cvc-profit-positive' : 'color: #ea580c;') : 'cvc-profit-negative'}">
                                ${results.paybackPeriod && results.paybackPeriod > 0 ? results.paybackPeriod.toFixed(1) + ' months' : 'Never'}
                            </span>
                        </div>
                    </div>
                </div>
            `;
            
            $('#cvc-results').html('<h2 class="cvc-section-title">💰 Financial Analysis</h2>' + html);
        },
        
        // Update assessment section
        updateAssessment: function(results, values) {
            var feedOptionText = this.getFeedOptionText(this.selectedFeed);
            var productionOptionText = this.getProductionOptionText(this.selectedProduction);
            
            var assessmentText = '';
            var recommendationText = '';
            
            if (results.monthlyProfit > 0) {
                assessmentText = `With ${values.birdCount} chickens using the ${feedOptionText} and ${productionOptionText}, 
                    you'll make $${results.monthlyProfit.toFixed(2)} per month. 
                    ${results.paybackPeriod && results.paybackPeriod > 0 
                        ? `Your $${values.startingCost} investment will pay for itself in ${results.paybackPeriod.toFixed(1)} months!`
                        : `Your $${values.startingCost} investment will pay for itself in ${results.paybackPeriod?.toFixed(1)} months.`
                    }`;
                    
                recommendationText = "This looks like a viable chicken-keeping venture! Consider starting with a small flock and expanding as you gain experience.";
            } else {
                assessmentText = `With ${values.birdCount} chickens using the ${feedOptionText} and ${productionOptionText}, 
                    you'll lose $${Math.abs(results.monthlyProfit).toFixed(2)} per month. 
                    Consider reducing costs or increasing egg production to make it viable.`;
                    
                recommendationText = "Consider starting with fewer chickens, using a more budget-friendly feeding approach, or increasing your egg prices to make this viable.";
            }
            
            var html = `
                <div class="cvc-assessment-point">
                    <div class="cvc-assessment-icon">💡</div>
                    <div>
                        <h4 class="cvc-assessment-title">Break-Even Analysis</h4>
                        <p class="cvc-assessment-text">
                            A dozen store-bought eggs costs $4-6+ in 2025. Each chicken lays about 20 eggs per month, 
                            so your feed cost per bird should be less than $6-10 to break even on eggs alone.
                        </p>
                    </div>
                </div>
                
                <div class="cvc-assessment-point">
                    <div class="cvc-assessment-icon">📊</div>
                    <div>
                        <h4 class="cvc-assessment-title">Your Assessment</h4>
                        <p class="cvc-assessment-text">${assessmentText}</p>
                    </div>
                </div>
                
                <div class="cvc-assessment-point">
                    <div class="cvc-assessment-icon">🎯</div>
                    <div>
                        <h4 class="cvc-assessment-title">Recommendations</h4>
                        <p class="cvc-assessment-text">${recommendationText}</p>
                    </div>
                </div>
            `;
            
            $('.cvc-assessment-section').html('<h2 class="cvc-section-title">💡 Viability Assessment</h2>' + html);
        },
        
        // Helper functions to get option text
        getFeedOptionText: function(optionId) {
            var options = {
                'budget': 'budget approach',
                'standard': 'standard approach',
                'premium': 'premium approach'
            };
            return options[optionId] || 'selected approach';
        },
        
        getProductionOptionText: function(optionId) {
            var options = {
                'conservative': 'conservative estimate',
                'realistic': 'realistic average',
                'optimistic': 'optimistic scenario'
            };
            return options[optionId] || 'selected scenario';
        }
    };

    // Initialize when document is ready
    $(document).ready(function() {
        if ($('#chicken-viability-calculator').length) {
            ChickenCalculator.init();
        }
    });

})(jQuery);