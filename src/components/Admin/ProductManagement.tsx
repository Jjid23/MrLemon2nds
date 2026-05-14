import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { MENU, ADDONS } from '../../constants/menu';
import { Save, RefreshCw, Layers, Coffee, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function ProductManagement() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'products'), (snapshot) => {
      if (snapshot.exists()) {
        setPrices(snapshot.data().prices || {});
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handlePriceChange = (key: string, value: string) => {
    const numValue = parseFloat(value);
    setPrices(prev => ({
      ...prev,
      [key]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'products'), { prices });
      toast.success('Prices updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save prices');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw size={48} className="text-lemon animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-20"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-stone-800 dark:text-stone-100 tracking-tight italic">PRODUCT PRICES</h2>
          <p className="text-stone-400 dark:text-stone-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Override default menu pricing</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-4 bg-stone-800 dark:bg-lemon text-white dark:text-stone-900 px-10 py-6 rounded-[32px] font-black text-xs uppercase tracking-widest hover:bg-stone-900 dark:hover:bg-zest transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-stone-800/20"
        >
          {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Drinks Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 text-stone-400">
            <Coffee size={24} />
            <h3 className="text-lg font-black uppercase tracking-[0.2em] italic">Drink Selection</h3>
          </div>
          
          <div className="space-y-6">
            {MENU.map(drink => (
              <div key={drink.id} className="bg-white dark:bg-stone-900 p-10 rounded-[48px] border border-stone-100 dark:border-stone-800 shadow-sm space-y-8">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-3xl flex items-center justify-center text-3xl shadow-inner italic">
                     {drink.id === 'lemonade' ? '🍋' : (drink.id === 'calamansi' ? '🍏' : '🍹')}
                   </div>
                   <h4 className="text-2xl font-black text-stone-800 dark:text-stone-100 italic">{drink.name}</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(drink.sizes).map(([size, data]) => {
                    const priceKey = `drink_${drink.id}_${size}`;
                    const currentPrice = prices[priceKey] !== undefined ? prices[priceKey] : data.price;
                    
                    return (
                      <div key={size} className="space-y-3">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-4">Size: {size}</label>
                        <div className="relative group">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 font-black italic">₱</span>
                          <input 
                            type="number"
                            value={currentPrice}
                            onChange={(e) => handlePriceChange(priceKey, e.target.value)}
                            className="w-full bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-100 dark:border-stone-800 rounded-[28px] px-12 py-5 font-black text-xl text-stone-800 dark:text-stone-100 outline-none focus:border-lemon transition-all italic"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 text-stone-400">
            <PlusCircle size={24} />
            <h3 className="text-lg font-black uppercase tracking-[0.2em] italic">Add-ons & Options</h3>
          </div>

          <div className="bg-white dark:bg-stone-900 p-10 rounded-[48px] border border-stone-100 dark:border-stone-800 shadow-sm space-y-10">
            <div className="space-y-6">
              <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest italic border-b border-stone-50 dark:border-stone-800 pb-4">Standard Add-ons</p>
              {ADDONS.map(addon => {
                const priceKey = `addon_${addon.name.replace(/\s+/g, '_').toLowerCase()}`;
                const currentPrice = prices[priceKey] !== undefined ? prices[priceKey] : addon.price;

                return (
                  <div key={addon.name} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[32px] bg-stone-50/50 dark:bg-stone-800/30 border border-stone-100/50 dark:border-stone-800 transition-all hover:bg-stone-50 dark:hover:bg-stone-800">
                    <span className="font-black text-stone-700 dark:text-stone-200 text-lg italic">{addon.name}</span>
                    <div className="relative w-full md:w-48 group">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 font-black italic">₱</span>
                      <input 
                        type="number"
                        value={currentPrice}
                        onChange={(e) => handlePriceChange(priceKey, e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 border-2 border-stone-100 dark:border-stone-800 rounded-2xl px-12 py-4 font-black text-lg text-stone-800 dark:text-stone-100 outline-none focus:border-lemon transition-all italic"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Layers size={18} className="text-stone-400" />
                <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest italic">Flavor Upgrades (Extras)</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {/* Find all flavored extra prices from constants to list them for easy editing */}
                {MENU.flatMap(d => Object.values(d.sizes).flatMap(s => 
                  s.categories ? Object.values(s.categories).flat() : []
                )).filter(f => typeof f === 'object' && (f as any).extra > 0).reduce((acc: any[], f: any) => {
                  if (!acc.find(item => item.name === f.name)) acc.push(f);
                   return acc;
                }, []).map((flavor: any) => {
                  const priceKey = `flavor_${flavor.name.replace(/\s+/g, '_').toLowerCase()}`;
                  const currentPrice = prices[priceKey] !== undefined ? prices[priceKey] : flavor.extra;

                  return (
                    <div key={flavor.name} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[32px] bg-stone-50/50 dark:bg-stone-800/30 border border-stone-100/50 dark:border-stone-800 transition-all hover:bg-stone-50 dark:hover:bg-stone-800">
                      <span className="font-black text-stone-700 dark:text-stone-200 text-lg italic">{flavor.name} Extra</span>
                      <div className="relative w-full md:w-48 group">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 font-black italic">₱</span>
                        <input 
                          type="number"
                          value={currentPrice}
                          onChange={(e) => handlePriceChange(priceKey, e.target.value)}
                          className="w-full bg-white dark:bg-stone-900 border-2 border-stone-100 dark:border-stone-800 rounded-2xl px-12 py-4 font-black text-lg text-stone-800 dark:text-stone-100 outline-none focus:border-lemon transition-all italic"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

