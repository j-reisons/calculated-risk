import { InputDataProps } from "./types";

export const CashflowsForm: React.FC<InputDataProps> = ({ inputData, setInputData }) => {

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {

        const cashflowString = event.target.value;
        const cashflows = parseCashflowString(cashflowString);

        setInputData(
            {
                ...inputData,
                cashflowString: cashflowString,
                cashflows: cashflows
            }
        );
    };

    return (
        <div>
            Cashflows:
            <input
                type="text"
                value={inputData.cashflowString}
                onChange={handleChange}
            />
            {validateCashFlows(inputData.cashflows, inputData.periods) || <p> Bad cashflow </p>}

        </div>
        // TODO: Add plot of the current cashflows vector
    )

}

// Check that cashflowString evaluates to a number[]
// Return the number[], else null
function parseCashflowString(cashflowString: string): (null | number[]) {
    let cashFlow: number[];
    try {
        // TODO: worry about safety
        cashFlow = new Function(`return ${cashflowString}`)();
    } catch (error) {
        return null;
    }

    if (!Array.isArray(cashFlow) ||
        !cashFlow.every((item) => typeof item === 'number')
    ) { return null }

    return cashFlow;
}

function validateCashFlows(cashflows: (number[] | null), expectedLength: number) {
    return cashflows != null && cashflows.length == expectedLength
}
