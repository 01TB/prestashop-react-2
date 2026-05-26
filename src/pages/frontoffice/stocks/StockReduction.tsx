import FrontofficeLayout from "../../../components/UI/Navigation/frontoffice/FrontofficeLayout.tsx";
import {useStockReduction} from "../../../hooks/frontoffice/stocks/useStockReduction.ts";


function StockReduction() {

    const {
        categories,
        loading,
        error,
        placing,
        numberReduction,
        setSelectedCategorie,
        setNumberReduction,
        reductionTotal,
        reductionReel,
        handleRedution,
    } = useStockReduction();

    const handleChangeCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategorie(Number(e.target.value));
    };

    const handleChangeReduction = (e: React.ChangeEvent<HTMLInputElement>) => {
        // e.target.value est toujours une string → conversion explicite
        setNumberReduction(Number(e.target.value));
    };

    return (
        <FrontofficeLayout title="Stock Reduction">
            {loading && <div className="text-center py-4">Chargement...</div>}

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {(!loading && !placing) && (
                <form>
                    <input id="numberReduction"
                           type="number"
                           value={numberReduction}
                           onChange={handleChangeReduction}
                           min={1}
                           step={1} />
                    <select id="categories" onChange={handleChangeCategory}>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name[1]}
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="btn btn-primary" onClick={handleRedution}>
                        Valider
                    </button>
                </form>
            )}

            {(!loading && placing) && (
                <div>
                    <form>
                        <input id="numberReduction"
                               type="number"
                               value={numberReduction}
                               onChange={handleChangeReduction}
                               min={1}
                               step={1} />
                        <select id="categories" onChange={handleChangeCategory}>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name[1]}
                                </option>
                            ))}
                        </select>
                        <button type="submit" className="btn btn-primary" onClick={handleRedution}>
                            Valider
                        </button>
                    </form>
                    <table>
                        <thead>
                            <th>Total</th>
                            <th>Réel</th>
                        </thead>
                        <tbody>
                            <td>{reductionTotal}</td>
                            <td>{reductionReel}</td>
                        </tbody>
                    </table>
                </div>
            )}
        </FrontofficeLayout>
    );

}

export default StockReduction;