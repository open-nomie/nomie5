/// <reference types="Cypress" />

context('App', () => {
	beforeEach(() => {
		cy.visit('http://localhost:5000');
	});

	it('cy.hash() - get the current URL hash', () => {
		// https://on.cypress.io/hash
		cy.hash().should('be.empty');
	});
	it('next button', () => {
		cy.get('.footer-buttons > .btn')
			.contains('Next')
			.click();

		cy.get('.footer-buttons > .btn')
			.contains('Next')
			.click();

		cy.get('.footer-buttons > .btn')
			.contains('Next')
			.click();

		// cy.get('.footer-buttons > .btn')
		// 	.contains('Login/Register')
		// 	.click();
	});
});
