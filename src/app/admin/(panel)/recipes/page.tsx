import { ActionForm, inputCls, labelCls, Submit } from "@/components/admin/ActionForm";
import { deleteRecipe, saveRecipe } from "@/app/admin/actions";
import { db } from "@/lib/db";

export const metadata = { title: "Recipes" };

type R = { id?: string; title?: string; note?: string; category?: string; body?: string; sortOrder?: number };

function RecipeForm({ r = {} }: { r?: R }) {
  const k = r.id ?? "new";
  return (
    <ActionForm action={saveRecipe} className="grid gap-2 sm:grid-cols-2">
      {r.id && <input type="hidden" name="id" value={r.id} />}
      <div>
        <label className={labelCls} htmlFor={`t-${k}`}>Title</label>
        <input id={`t-${k}`} name="title" required maxLength={80} defaultValue={r.title} className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor={`c-${k}`}>Category (chip)</label>
        <input id={`c-${k}`} name="category" required maxLength={40} defaultValue={r.category ?? "Drinks"} list="recipe-cats" className={inputCls} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls} htmlFor={`n-${k}`}>One-line note</label>
        <input id={`n-${k}`} name="note" required maxLength={160} defaultValue={r.note} className={inputCls} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls} htmlFor={`b-${k}`}>Method</label>
        <textarea id={`b-${k}`} name="body" required maxLength={3000} rows={3} defaultValue={r.body} className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor={`s-${k}`}>Display order</label>
        <input id={`s-${k}`} name="sortOrder" type="number" min={0} max={9999} defaultValue={r.sortOrder ?? 10} className={inputCls} />
      </div>
      <div className="flex items-end">
        <Submit>{r.id ? "Save recipe" : "Add recipe"}</Submit>
      </div>
    </ActionForm>
  );
}

export default async function RecipesAdmin() {
  const recipes = await db.recipe.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });
  return (
    <>
      <h1 className="font-head text-3xl font-semibold">Recipes</h1>
      <datalist id="recipe-cats">
        {["Drinks", "Breakfast", "Snacks"].map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <div className="mt-4 space-y-4">
        {recipes.map((r) => (
          <section key={r.id} className="rounded-card bg-card p-4 shadow-soft">
            <RecipeForm r={r} />
            <ActionForm action={deleteRecipe} className="mt-2">
              <input type="hidden" name="id" value={r.id} />
              <Submit variant="danger" className="min-h-8 px-3 py-1 text-xs">Delete recipe</Submit>
            </ActionForm>
          </section>
        ))}
        <section className="rounded-card border border-dashed border-gold bg-paper p-4">
          <h2 className="mb-2 font-head text-lg font-semibold">New recipe</h2>
          <RecipeForm />
        </section>
      </div>
    </>
  );
}
