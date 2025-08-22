/*	jQuery Nice Select - v1.2.2
	Updated by TOYEAN in August 2025
	https://www.toyean.com
**
	original by Hernán Sartorio
	https://github.com/hernansartorio/jquery-nice-select
*/
(function($) {
	$.fn.niceSelect = function(method) {
		// Methods
		if (typeof method == 'string') {
			if (method == 'update') {
				this.each(function() {
					var $select = $(this);
					var $dropdown = $(this).next('.nice-select');
					var open = $dropdown.hasClass('open');

					if ($dropdown.length) {
						$dropdown.remove();
						create_nice_select($select);

						if (open) {
							$select.next().trigger('click');
						}
					}
				});
			} else if (method == 'destroy') {
				this.each(function() {
					var $select = $(this);
					var $dropdown = $(this).next('.nice-select');

					if ($dropdown.length) {
						$dropdown.remove();
						$select.css('display', '');
					}
				});
				if ($('.nice-select').length == 0) {
					$(document).off('.nice_select');
				}
			} else {
				console.log('Method "' + method + '" does not exist.');
			}
			return this;
		}

		// Hide native select
		this.hide();

		// Create custom markup
		this.each(function() {
			var $select = $(this);

			if (!$select.next().hasClass('nice-select')) {
				create_nice_select($select);
			}
		});

		function create_nice_select($select) {
			var isMultiple = $select.attr('multiple');
			var $niceSelect = $('<div></div>')
				.addClass('nice-select')
				.addClass($select.attr('class') || '')
				.addClass($select.attr('disabled') ? 'disabled' : '')
				.attr('tabindex', $select.attr('disabled') ? null : '0')
				.html('<span class="current"></span><ul class="list"></ul>');

			var styleAttr = $select.attr('style');
			if (styleAttr && styleAttr.includes('width')) {
				var selectWidth = $select.css('width');
				if (selectWidth) {
					$niceSelect.css('width', selectWidth);
				}
			}

			$select.after($niceSelect);

			var $dropdown = $select.next();
			var $options = $select.find('option');
			var $selected = $select.find('option:selected');

			if (isMultiple) {
				$dropdown.addClass('multiple');
				$dropdown.find('.current').html('Select');
				$dropdown.find('.list').prepend('<li class="option all" data-value="all">Select All</li>');
			} else {
				$dropdown.find('.current').html($selected.data('display') || $selected.text());
			}

			$options.each(function(i) {
				var $option = $(this);
				var display = $option.data('display');

				$dropdown.find('ul').append($('<li></li>')
					.attr('data-value', $option.val())
					.attr('data-display', (display || null))
					.addClass('option' +
						($option.is(':selected') ? ' selected' : '') +
						($option.is(':disabled') ? ' disabled' : ''))
					.html($option.text())
				);
			});

			if (isMultiple) {
				updateMultipleCurrent($select, $dropdown);
				var allOptions = $dropdown.find('.option:not(.disabled):not(.all)');
				var allSelected = allOptions.length > 0 && allOptions.filter('.selected').length === allOptions.length;
				$dropdown.find('.option.all').toggleClass('selected', allSelected);
				$select.find('option[value="all"]').prop('selected', allSelected);
			}
		}

		function updateMultipleCurrent($select, $dropdown) {
			var selectedOptions = $select.find('option:selected:not(:disabled)');
			var selectedTexts = [];
			selectedOptions.each(function() {
				if ($(this).val() !== 'all') {
					selectedTexts.push($(this).text());
				}
			});
			if (selectedTexts.length === 0) {
				$dropdown.find('.current').html('Select');
			} else if (selectedTexts.length === 1) {
				$dropdown.find('.current').html(selectedTexts[0]);
			} else {
				$dropdown.find('.current').html(selectedTexts.join(', '));
			}
			if (selectedTexts.length > 1) {
				$dropdown.find('.current').addClass('multiple-selected');
			} else {
				$dropdown.find('.current').removeClass('multiple-selected');
			}
		}

		/* Event listeners */

		// Unbind existing events in case that the plugin has been initialized before
		$(document).off('.nice_select');

		// Open/close
		$(document).on('click.nice_select', '.nice-select', function(event) {
			var $dropdown = $(this);

			$('.nice-select').not($dropdown).removeClass('open');
			$dropdown.toggleClass('open');

			if (!$dropdown.hasClass('multiple')) {
				if ($dropdown.hasClass('open')) {
					$dropdown.find('.option');
					$dropdown.find('.focus').removeClass('focus');
					$dropdown.find('.selected').addClass('focus');
				} else {
					$dropdown.focus();
				}
			}
		});

		// Close when clicking outside
		$(document).on('click.nice_select', function(event) {
			if ($(event.target).closest('.nice-select').length === 0) {
				$('.nice-select').removeClass('open').find('.option');
			}
		});

		// Option click
		$(document).on('click.nice_select', '.nice-select .option:not(.disabled)', function(event) {
			var $option = $(this);
			var $dropdown = $option.closest('.nice-select');
			var isMultiple = $dropdown.hasClass('multiple');

			if (isMultiple) {
				if ($option.hasClass('all')) {
					var options = $dropdown.find('.option:not(.disabled):not(.all)');
					var isAllSelected = options.filter('.selected').length === options.length;
					options.toggleClass('selected', !isAllSelected);
					$option.toggleClass('selected', !isAllSelected);
					$dropdown.prev('select').find('option:not(:disabled):not([value="all"])').prop('selected', !isAllSelected);
				} else {
					$option.toggleClass('selected');
					$dropdown.prev('select').find('option[value="' + $option.data('value') + '"]').prop('selected', $option.hasClass('selected'));
					var allOptions = $dropdown.find('.option:not(.disabled):not(.all)');
					var allSelected = allOptions.length > 0 && allOptions.filter('.selected').length === allOptions.length;
					$dropdown.find('.option.all').toggleClass('selected', allSelected);
					$dropdown.prev('select').find('option[value="all"]').prop('selected', allSelected);
				}
				updateMultipleCurrent($dropdown.prev('select'), $dropdown);
				event.stopPropagation();
			} else {
				$dropdown.find('.selected').removeClass('selected');
				$option.addClass('selected');

				var text = $option.data('display') || $option.text();
				$dropdown.find('.current').text(text);
				$dropdown.prev('select').val($option.data('value')).trigger('change');
			}
		});

		// Keyboard events
		$(document).on('keydown.nice_select', '.nice-select', function(event) {
			var $dropdown = $(this);
			var $focused_option = $($dropdown.find('.focus') || $dropdown.find('.list .option.selected'));

			// Space or Enter
			if (event.keyCode == 32 || event.keyCode == 13) {
				if ($dropdown.hasClass('open')) {
					$focused_option.trigger('click');
				} else {
					$dropdown.trigger('click');
				}
				return false;
			// Down
			} else if (event.keyCode == 40) {
				if (!$dropdown.hasClass('open')) {
					$dropdown.trigger('click');
				} else {
					var $next = $focused_option.nextAll('.option:not(.disabled)').first();
					if ($next.length > 0) {
						$dropdown.find('.focus').removeClass('focus');
						$next.addClass('focus');
					}
				}
				return false;
			// Up
			} else if (event.keyCode == 38) {
				if (!$dropdown.hasClass('open')) {
					$dropdown.trigger('click');
				} else {
					var $prev = $focused_option.prevAll('.option:not(.disabled)').first();
					if ($prev.length > 0) {
						$dropdown.find('.focus').removeClass('focus');
						$prev.addClass('focus');
					}
				}
				return false;
			// Esc
			} else if (event.keyCode == 27) {
				if ($dropdown.hasClass('open')) {
					$dropdown.trigger('click');
				}
			// Tab
			} else if (event.keyCode == 9) {
				if ($dropdown.hasClass('open')) {
					return false;
				}
			}
		});

		// Detect CSS pointer-events support, for IE <= 10. From Modernizr.
		var style = document.createElement('a').style;
		style.cssText = 'pointer-events:auto';
		if (style.pointerEvents !== 'auto') {
			$('html').addClass('no-csspointerevents');
		}

		return this;
	};
}(jQuery));