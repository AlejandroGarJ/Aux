(function(ng){
	
	"use strict";

	ng.module('App').directive('cvalidation', function (ClienteService) {

		var DNI_REGEX = /^(\d{8})([A-Z])$/;
		var CIF_REGEX = /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/;
		var NIE_REGEX = /^[XYZ]\d{7,8}[A-Z]$/;

		function validateDocument(str) {
			// Ensure upcase and remove whitespace
			str = str.toUpperCase().replace(/\s/, '');
	
			var valid = false;
			var type = spainIdType( str );
	
			switch (type) {
			case 'dni':
				valid = validDNI( str );
				break;
			case 'nie':
				valid = validNIE( str );
				break;
			case 'cif':
				valid = validCIF( str );
				break;
			}
	
			return {
				type: type,
				valid: valid
			}
		}
		function spainIdType( str ) {
			if ( str.match( DNI_REGEX ) ) {
			return 'dni';
			}
			if ( str.match( CIF_REGEX ) ) {
			return 'cif';
			}
			if ( str.match( NIE_REGEX ) ) {
			return 'nie';
			}
		};
		function validDNI( dni ) {
			var dni_letters = "TRWAGMYFPDXBNJZSQVHLCKE";
			var letter = dni_letters.charAt( parseInt( dni, 10 ) % 23 );
			
			return letter == dni.charAt(8);
		};
		function validNIE( nie ) {
	
			// Change the initial letter for the corresponding number and validate as DNI
			var nie_prefix = nie.charAt( 0 );
	
			switch (nie_prefix) {
			case 'X': nie_prefix = 0; break;
			case 'Y': nie_prefix = 1; break;
			case 'Z': nie_prefix = 2; break;
			}
	
			return validDNI( nie_prefix + nie.substr(1) );
	
		};
		function validCIF( cif ) {
			if (!cif || cif.length !== 9) {
				return false;
			}

			var letters = ['J', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
			var digits = cif.substr(1, cif.length - 2);
			var letter = cif.substr(0, 1);
			var control = cif.substr(cif.length - 1);
			var sum = 0;
			var i;
			var digit;

			if (!letter.match(/[A-Z]/)) {
				return false;
			}

			for (i = 0; i < digits.length; ++i) {
				digit = parseInt(digits[i]);

				if (isNaN(digit)) {
					return false;
				}

				if (i % 2 === 0) {
					digit *= 2;
					if (digit > 9) {
						digit = parseInt(digit / 10) + (digit % 10);
					}

					sum += digit;
				} else {
					sum += digit;
				}
			}

			sum %= 10;
			if (sum !== 0) {
				digit = 10 - sum;
			} else {
				digit = sum;
			}

			if (letter.match(/[ABEH]/)) {
				return String(digit) === control;
			}
			if (letter.match(/[NPQRSW]/)) {
				return letters[digit] === control;
			}

			return String(digit) === control || letters[digit] === control;
		};

		function validateIban(input) {
			var CODE_LENGTHS = {
				AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
				CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
				FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
				HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
				LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
				MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
				RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26
			};
			var iban = String(input).toUpperCase().replace(/[^A-Z0-9]/g, ''), // keep only alphanumeric characters
					code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/), // match and capture (1) the country code, (2) the check digits, and (3) the rest
					digits;
			// check syntax and length
			if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
				return false;
			}
			// rearrange country code and check digits, and convert chars to ints
			digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter) {
				return letter.charCodeAt(0) - 55;
			});
			// final check
			return mod97(digits);
		}
		function mod97(string) {
			var checksum = string.slice(0, 2), fragment;
			for (var offset = 2; offset < string.length; offset += 7) {
				fragment = String(checksum) + string.substring(offset, offset + 7);
				checksum = parseInt(fragment, 10) % 97;
			}
			return checksum;
		}

		function validateBic(input) {
			if(input.length > 7 && input.length < 12)
				return true;
			else
				return false;
		}

	    return {
			require: 'ngModel',
			link: function(scope, elem, attr, ngModel) {
				if(ngModel) {
					var typeValidation = attr.cvalidation;
					switch (typeValidation) {
						case 'document_a':
						case 'document_n':
						case 'document_c':
							// ngModel.$parsers.unshift(function (value) {
							// 	ngModel.$setValidity('docValidation', validateDocument(value).valid === true);
							// 	return value;
							// });

							var valValue = false;
							ngModel.$parsers.unshift(function (value) {
								
								// if(validateDocument(value).valid === true) {
								if((typeValidation == 'document_a' && validateDocument(value).valid === true) ||
								(typeValidation == 'document_n' && validateDocument(value).valid === true && (validateDocument(value).type == 'dni' || validateDocument(value).type == 'nie')) ||
								(typeValidation == 'document_a' && validateDocument(value).valid === true && validateDocument(value).type == 'cif')) {
									ClienteService.validaDocumento({'NU_DOCUMENTO': value})
									.then(function successCallback(response) {
										if(response.status == 200) {
											if(response.data.ID_RESULT != 103) {
												valValue = true;
											} else {
												valValue = false;
											}
											ngModel.$setValidity('docValidation', valValue);
										}
									}, function callBack(response) {
										// if (response.status == 406 || response.status == 401) {
										// }
										valValue = false;
									});
								} else {
									valValue = false;
								}
								setTimeout(function() {
									ngModel.$setValidity('docValidation', valValue);
								}, 500);
								return value;
							});

							break;
						case 'iban':
							ngModel.$parsers.unshift(function (value) {
								ngModel.$setValidity('ibanValidation', validateIban(value) === 1);
								return value;
							});
							break;
						case 'bic':
							ngModel.$parsers.unshift(function (value) {
								value = value.replace(/ /g, '');
								ngModel.$setValidity('bicValidation', validateBic(value));
								return value;
							});
							break;
					
						default:
							break;
					}
					
				}
			}
		};
	})
})(window.angular);