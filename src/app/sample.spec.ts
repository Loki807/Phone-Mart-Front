describe('Frontend Test Suite', () => {
    it('Should correctly verify basic logic', () => {
        expect(1 + 1).toEqual(2);
    });
    
    it('Should verify string assertions', () => {
        expect("PhoneMart").toContain("Phone");
    });
});
